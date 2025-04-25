import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { ShareIcon, HeartIcon } from '@heroicons/react/24/outline';

interface Confession {
  id: string;
  content: string;
  likes: number;
  reactions: { [key: string]: number };
  createdAt: string;
}

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const confessionLink = `${window.location.origin}/confess/${user?.confessionLink}`;

  useEffect(() => {
    const fetchConfessions = async () => {
      try {
        const response = await axios.get(`/api/confessions/user/${user?.id}`);
        setConfessions(response.data.confessions);
      } catch (err) {
        setError('Failed to load confessions');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchConfessions();
    }
  }, [user]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(confessionLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Send me an anonymous confession',
          text: 'Share your thoughts anonymously with me on Campus Confessions!',
          url: confessionLink,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{username}</h1>
            <p className="text-gray-600">{user?.collegeName}</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {`${user?.subscription?.type?.charAt(0).toUpperCase() ?? 'F'}${user?.subscription?.type?.slice(1) ?? 'ree'} Plan`}
            </span>
            <button
              onClick={handleShare}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <ShareIcon className="h-5 w-5 mr-2" />
              Share Profile
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <p className="text-sm text-gray-600">Your confession link:</p>
            <div className="flex items-center mt-1">
              <input
                type="text"
                readOnly
                value={confessionLink}
                className="flex-1 text-sm bg-white p-2 rounded border border-gray-300"
              />
              <button
                onClick={handleCopyLink}
                className="ml-2 px-4 py-2 text-sm text-primary-600 hover:text-primary-700"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowQR(!showQR)}
            className="ml-4 text-primary-600 hover:text-primary-700"
          >
            {showQR ? 'Hide QR' : 'Show QR'}
          </button>
        </div>

        {showQR && (
          <div className="mt-4 flex justify-center">
            <QRCodeSVG value={confessionLink} size={200} />
          </div>
        )}
      </motion.div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Your Confessions</h2>
        {error && (
          <div className="text-red-500 text-center">{error}</div>
        )}
        {confessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No confessions yet. Share your profile link to receive anonymous messages!
          </div>
        ) : (
          confessions.map((confession) => (
            <motion.div
              key={confession.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <p className="text-gray-800 mb-4">{confession.content}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <HeartIcon className="h-5 w-5 text-red-500 mr-1" />
                  <span>{confession.likes}</span>
                </div>
                <span>
                  {new Date(confession.createdAt).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Profile; 