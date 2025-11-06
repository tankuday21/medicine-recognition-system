// Video View Component
// Video tutorial player with chapters, captions, and interactive features

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { helpContentManager } from '../../utils/helpSystem';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

/**
 * Video View Component
 */
export const VideoView = ({ video, onRelatedSelect, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [relatedContent, setRelatedContent] = useState([]);
  const [isHelpful, setIsHelpful] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);
  
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    if (video?.relatedArticles) {
      const related = video.relatedArticles
        .map(id => helpContentManager.helpArticles.get(id))
        .filter(Boolean);
      setRelatedContent(related);
    }
  }, [video]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleHelpfulClick = (helpful) => {
    setIsHelpful(helpful);
    
    // Track feedback
    helpContentManager.trackView(video.id, 'video', {
      feedback: helpful ? 'helpful' : 'not-helpful',
      watchTime: currentTime,
      completed: currentTime >= duration * 0.9
    });
  };

  if (!video) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Video not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Video Player */}
      <div 
        ref={containerRef}
        className="relative bg-black flex-shrink-0"
      >
        <video
          ref={videoRef}
          className="w-full h-auto max-h-96"
          poster={video.thumbnail}
          preload="metadata"
          controls
        >
          <source src={video.videoUrl} type="video/mp4" />
          {video.captions && (
            <track
              kind="captions"
              src={video.captions}
              srcLang="en"
              label="English"
              default={showCaptions}
            />
          )}
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Info */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {video.title}
                </h1>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{Math.ceil(video.duration / 60)} minutes</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Video Tutorial</span>
                  </div>
                </div>
                
                <p className="text-gray-700 leading-relaxed mb-6">
                  {video.description}
                </p>
              </div>

              {/* Chapters List */}
              {video.chapters && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Video Chapters
                  </h2>
                  <div className="space-y-2">
                    {video.chapters.map((chapter, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {chapter.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {formatTime(chapter.time)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback */}
              <Card className="p-4">
                <h3 className="font-medium text-gray-900 mb-3">Was this video helpful?</h3>
                
                {isHelpful === null ? (
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => handleHelpfulClick(true)}
                      className="flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      <span>Yes</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => handleHelpfulClick(false)}
                      className="flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                      </svg>
                      <span>No</span>
                    </Button>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-800">
                      {isHelpful 
                        ? '[SUCCESS] Thank you for your feedback! We\'re glad this video was helpful.'
                        : '[INFO] Thank you for your feedback. We\'ll work on improving our video content.'
                      }
                    </p>
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Related Articles */}
              {relatedContent.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Related Articles</h3>
                  
                  <div className="space-y-3">
                    {relatedContent.map((related) => (
                      <button
                        key={related.id}
                        onClick={() => onRelatedSelect(related, 'article')}
                        className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        <h4 className="font-medium text-gray-900 text-sm mb-1">
                          {related.title}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {related.estimatedReadTime} min read
                        </p>
                      </button>
                    ))}
                  </div>
                </Card>
              )}

              {/* Video Stats */}
              <Card className="p-4">
                <h3 className="font-medium text-gray-900 mb-4">Video Info</h3>
                
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{Math.ceil(video.duration / 60)} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chapters:</span>
                      <span>{video.chapters?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoView;