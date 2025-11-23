/**
 * User Feedback Collection System
 * 
 * Comprehensive feedback collection including surveys, ratings, and bug reports
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { MessageCircle, Star, Bug, Lightbulb, ThumbsUp, ThumbsDown } from 'lucide-react';

const FeedbackSystem = ({ onSubmit }) => {
  const [feedbackType, setFeedbackType] = useState('general');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = async () => {
    const feedbackData = {
      type: feedbackType,
      rating,
      feedback,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    if (onSubmit) {
      await onSubmit(feedbackData);
    }
    
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFeedback('');
      setRating(0);
    }, 3000);
  };
  
  const feedbackTypes = [
    { id: 'general', label: 'General Feedback', icon: MessageCircle },
    { id: 'bug', label: 'Bug Report', icon: Bug },
    { id: 'feature', label: 'Feature Request', icon: Lightbulb },
    { id: 'rating', label: 'Rate Experience', icon: Star }
  ];
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Share Your Feedback</CardTitle>
        <CardDescription>
          Help us improve the Amapiano AI Platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Feedback Type Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {feedbackTypes.map(type => {
            const Icon = type.icon;
            return (
              <Button
                key={type.id}
                variant={feedbackType === type.id ? 'default' : 'outline'}
                onClick={() => setFeedbackType(type.id)}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{type.label}</span>
              </Button>
            );
          })}
        </div>
        
        {/* Rating (for rating type) */}
        {feedbackType === 'rating' && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium">How would you rate your experience?</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              {rating === 0 && 'Click to rate'}
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          </div>
        )}
        
        {/* Feedback Text */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {feedbackType === 'bug' && 'Describe the bug'}
            {feedbackType === 'feature' && 'Describe your feature request'}
            {feedbackType === 'rating' && 'Additional comments (optional)'}
            {feedbackType === 'general' && 'Your feedback'}
          </label>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={
              feedbackType === 'bug' 
                ? 'What happened? What did you expect to happen?' 
                : feedbackType === 'feature'
                ? 'What feature would you like to see?'
                : 'Share your thoughts...'
            }
            rows={6}
            className="w-full"
          />
        </div>
        
        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={submitted || (feedbackType === 'rating' && rating === 0) || !feedback.trim()}
          className="w-full"
        >
          {submitted ? '✓ Thank you for your feedback!' : 'Submit Feedback'}
        </Button>
        
        {/* Quick Reactions */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-2">Quick Reaction</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (onSubmit) {
                  onSubmit({
                    type: 'quick_reaction',
                    reaction: 'like',
                    timestamp: new Date().toISOString()
                  });
                }
              }}
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Like
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (onSubmit) {
                  onSubmit({
                    type: 'quick_reaction',
                    reaction: 'dislike',
                    timestamp: new Date().toISOString()
                  });
                }
              }}
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Dislike
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackSystem;

