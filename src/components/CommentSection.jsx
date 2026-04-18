import React, { useState } from 'react';
import './CommentSection.css';

export default function CommentSection({ designId, initialComments = [] }) {
    const [comments, setComments] = useState(initialComments);
    const [newComment, setNewComment] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const comment = {
            id: Date.now(),
            author: 'You',
            text: newComment,
            time: 'Just now'
        };

        setComments([...comments, comment]);
        setNewComment('');
    };

    return (
        <div className="comment-section glass-panel">
            <h3>Design Feedback ({comments.length})</h3>

            <div className="comments-list">
                {comments.map(c => (
                    <div key={c.id} className="comment">
                        <div className="comment-avatar">{c.author.charAt(0)}</div>
                        <div className="comment-body">
                            <div className="comment-header">
                                <strong>{c.author}</strong> <span>{c.time}</span>
                            </div>
                            <p>{c.text}</p>
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="comment-form">
                <input
                    type="text"
                    placeholder="Add your thoughts or iterate..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit" disabled={!newComment.trim()}>Post</button>
            </form>
        </div>
    );
}
