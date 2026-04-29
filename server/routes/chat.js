const express = require('express');
const { auth, optionalAuth } = require('../middleware/auth');
const geminiService = require('../services/geminiService');
const ChatMessage = require('../models/ChatMessage');
const mongoose = require('mongoose');

const router = express.Router();

// Send message to AI assistant
router.post('/message', optionalAuth, async (req, res) => {
  try {
    const { message, conversationId, language } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Validation error', message: 'Message is required' });
    }

    if (message.length > 2000) {
      return res.status(400).json({ error: 'Validation error', message: 'Message is too long (max 2000 characters)' });
    }

    // Generate or use existing conversation ID
    const convId = conversationId || new mongoose.Types.ObjectId().toString();
    const userId = req.user?._id;

    console.log(`💬 Chat from ${userId ? 'user:' + userId : 'anonymous'}, convId: ${convId}`);

    // Get conversation history from database for context (last 10 messages)
    let conversationHistory = [];
    if (userId) {
      try {
        const previousMessages = await ChatMessage.find({
          userId: new mongoose.Types.ObjectId(userId),
          conversationId: convId
        })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();

        conversationHistory = previousMessages.reverse().map(msg => ({
          sender: msg.sender,
          message: msg.content
        }));
        console.log(`📜 Loaded ${conversationHistory.length} previous messages for context`);
      } catch (err) {
        console.error('Error loading history:', err);
      }
    }

    // Build user context
    let enhancedUserContext = {};
    if (req.user) {
      enhancedUserContext = {
        userId: req.user._id,
        name: req.user.name,
        age: req.user.age,
        medicalConditions: req.user.medicalConditions || [],
        currentMedications: req.user.currentMedications || [],
        allergies: req.user.allergies || []
      };
    }

    // Save user message to database FIRST
    if (userId) {
      try {
        const savedUserMsg = await ChatMessage.create({
          userId: new mongoose.Types.ObjectId(userId),
          conversationId: convId,
          content: message.trim(),
          sender: 'user'
        });
        console.log(`✅ Saved user message: ${savedUserMsg._id}`);
      } catch (err) {
        console.error('Error saving user message:', err);
      }
    }

    // Generate AI response
    let aiResponse;
    if (process.env.ENABLE_AI_CHAT === 'true' && process.env.GEMINI_API_KEY) {
      const result = await geminiService.generateChatResponse(
        message.trim(),
        conversationHistory,
        enhancedUserContext,
        language
      );

      if (result.success) {
        aiResponse = {
          message: result.data.message || "I'm sorry, I couldn't generate a response. Please try again.",
          followUpSuggestions: result.data.followUpSuggestions,
          timestamp: result.data.timestamp
        };
      } else {
        throw new Error(result.error || 'AI processing failed');
      }
    } else {
      aiResponse = {
        message: "I'm currently in demo mode. Please configure your Gemini API key to enable real AI conversations.",
        followUpSuggestions: ["Tell me about medications", "Help with symptoms"],
        timestamp: new Date().toISOString()
      };
    }

    // Save AI response to database
    if (userId) {
      try {
        const savedAiMsg = await ChatMessage.create({
          userId: new mongoose.Types.ObjectId(userId),
          conversationId: convId,
          content: aiResponse.message,
          sender: 'assistant',
          aiResponse: { followUpQuestions: aiResponse.followUpSuggestions }
        });
        console.log(`✅ Saved AI message: ${savedAiMsg._id}`);
      } catch (err) {
        console.error('Error saving AI message:', err);
      }
    }

    res.json({
      success: true,
      data: {
        ...aiResponse,
        conversationId: convId
      }
    });

  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({ error: 'Chat failed', message: 'Internal server error' });
  }
});

// Get all conversations (list)
router.get('/conversations', auth, async (req, res) => {
  try {
    console.log(`📋 Getting conversations for user: ${req.user._id}`);

    const conversations = await ChatMessage.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user._id) } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$content' },
          lastMessageAt: { $first: '$createdAt' },
          messageCount: { $sum: 1 },
          firstUserMessage: {
            $last: {
              $cond: [{ $eq: ['$sender', 'user'] }, '$content', null]
            }
          }
        }
      },
      { $sort: { lastMessageAt: -1 } },
      { $limit: 20 }
    ]);

    console.log(`📋 Found ${conversations.length} conversations`);

    const formattedConversations = conversations.map(conv => ({
      id: conv._id,
      title: (conv.firstUserMessage || conv.lastMessage || 'New Chat').substring(0, 50) + ((conv.firstUserMessage || conv.lastMessage || '').length > 50 ? '...' : ''),
      lastMessage: (conv.lastMessage || '').substring(0, 60) + ((conv.lastMessage || '').length > 60 ? '...' : ''),
      lastMessageAt: conv.lastMessageAt,
      messageCount: conv.messageCount
    }));

    res.json({ success: true, data: formattedConversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations', message: 'Internal server error' });
  }
});

// Get messages for a specific conversation
router.get('/conversations/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    console.log(`📖 Loading conversation: ${conversationId} for user: ${req.user._id}`);

    const messages = await ChatMessage.find({
      userId: new mongoose.Types.ObjectId(req.user._id),
      conversationId
    }).sort({ createdAt: 1 }).lean();

    console.log(`📖 Found ${messages.length} messages`);

    const formattedMessages = messages.map(msg => ({
      id: msg._id.toString(),
      content: msg.content,
      sender: msg.sender,
      timestamp: msg.createdAt,
      followUpQuestions: msg.aiResponse?.followUpQuestions
    }));

    res.json({ success: true, data: formattedMessages, conversationId });
  } catch (error) {
    console.error('Get conversation messages error:', error);
    res.status(500).json({ error: 'Failed to get messages', message: 'Internal server error' });
  }
});

// Delete a conversation
router.delete('/conversations/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;

    const result = await ChatMessage.deleteMany({
      userId: new mongoose.Types.ObjectId(req.user._id),
      conversationId
    });

    console.log(`🗑️ Deleted ${result.deletedCount} messages from conversation: ${conversationId}`);

    res.json({ success: true, message: 'Conversation deleted' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation', message: 'Internal server error' });
  }
});

// Start a new conversation
router.post('/conversations/new', auth, async (req, res) => {
  try {
    const conversationId = new mongoose.Types.ObjectId().toString();
    res.json({ success: true, data: { conversationId } });
  } catch (error) {
    console.error('New conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation', message: 'Internal server error' });
  }
});

// Proactive initialization for medicine chat
router.post('/initialize-medicine-chat', auth, async (req, res) => {
  try {
    const { medicineContext } = req.body;
    const userId = req.user._id;

    if (!medicineContext) {
      return res.status(400).json({ success: false, error: 'Context is required' });
    }

    console.log(`[PROACTIVE] Initializing medicine chat for user: ${userId}`);

    // Generate proactive insight
    const result = await geminiService.generateProactiveInsight(medicineContext);

    if (result.success) {
      const convId = `med_${userId}_${Date.now()}`;
      
      // Save to database
      await ChatMessage.create({
        userId: userId,
        conversationId: convId,
        content: result.text,
        sender: 'assistant',
        context: { medicine: JSON.stringify(medicineContext) }
      });

      return res.json({
        success: true,
        conversationId: convId,
        initialMessage: result.text
      });
    } else {
      throw new Error(result.error || 'Initialization failed');
    }
  } catch (error) {
    console.error('❌ Proactive init error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Medicine-specific query endpoint (supports context history)
router.post('/medicine-query', optionalAuth, async (req, res) => {
  try {
    const { message, medicineContext, conversationId, language } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    if (!medicineContext) {
      return res.status(400).json({ success: false, error: 'Medicine context is required' });
    }

    const userId = req.user?._id;
    // Always ensure we have a conversationId
    const convId = conversationId || (userId ? `med_${userId}_${Date.now()}` : `med_anon_${Date.now()}`);

    console.log(`💊 Medicine query from ${userId ? 'user:' + userId : 'anonymous'}, convId: ${convId}`);

    // Load history if user is authenticated
    let conversationHistory = [];
    if (userId && convId) {
      try {
        const previousMessages = await ChatMessage.find({
          userId: userId,
          conversationId: convId
        })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();

        conversationHistory = previousMessages.reverse().map(msg => ({
          sender: msg.sender,
          message: msg.content
        }));
      } catch (err) {
        console.error('Error loading medicine chat history:', err);
      }
    }

    // Save user message to database if user is authenticated
    if (userId && convId) {
      try {
        await ChatMessage.create({
          userId: userId,
          conversationId: convId,
          content: message.trim(),
          sender: 'user',
          context: { medicine: medicineContext }
        });
      } catch (err) {
        console.error('Error saving medicine query message:', err);
      }
    }

    // Generate AI response
    const result = await geminiService.generateMedicineQueryResponse(
      message.trim(),
      medicineContext,
      conversationHistory,
      language
    );

    console.log(`🤖 AI Response Success: ${result.success}, Provider: ${result.data?.provider}`);

    if (result.success && result.data?.message) {
      // Save AI response to database if user is authenticated
      if (userId && convId) {
        try {
          await ChatMessage.create({
            userId: userId,
            conversationId: convId,
            content: result.data.message,
            sender: 'assistant',
            aiResponse: { provider: result.data.provider }
          });
        } catch (err) {
          console.error('Error saving AI medicine response:', err);
        }
      }

      return res.json({
        success: true,
        response: result.data.message,
        data: {
          ...result.data,
          conversationId: convId
        }
      });
    } else {
      throw new Error(result.error || 'AI processing failed');
    }
  } catch (error) {
    console.error('❌ Medicine query error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to process query' });
  }
});

module.exports = router;
