import React, { useState, useEffect } from 'react';

export function Archive({ API_URL }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/tracks?limit=50`)
      .then(res => res.json())
      .then(data => {
        setTracks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch tracks:', err);
        setLoading(false);
      });
  }, [API_URL]);

  return (
    <div className="page-content">
      <section className="archive-box">
        <div className="box-title">>>> BROADCAST ARCHIVE</div>
        
        {loading ? (
          <div className="archive-message">Loading transmission logs...</div>
        ) : tracks.length === 0 ? (
          <div className="archive-message">No broadcasts recorded yet.</div>
        ) : (
          <div className="archive-list">
            {tracks.map((track, idx) => (
              <div key={idx} className="archive-item">
                <div className="archive-track">
                  <span className="archive-title">{track.title}</span>
                  <span className="archive-mood">{track.mood}</span>
                </div>
                <div className="archive-meta">
                  {track.headline && <span className="archive-headline">{track.headline}</span>}
                  <span className="archive-date">
                    {new Date(track.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="info-box">
        <div className="box-title">>>> TRANSMISSION STATS</div>
        <div className="stats-content">
          <p>Total broadcasts: {tracks.length}</p>
          <p>Format: 24/7 AI-generated</p>
          <p>Moods: {new Set(tracks.map(t => t.mood)).size} genres</p>
          <p>Status: ACTIVE</p>
        </div>
      </section>
    </div>
  );
}
