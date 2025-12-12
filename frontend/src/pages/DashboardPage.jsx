import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router';
import Navbar from '../components/Navbar';
import { Bell, MapPin, TrendingUp, Heart, Users, UserMinus, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWebSocket } from '../hooks/useWebSocket';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

function DashboardPage() {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [cityStats, setCityStats] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // WebSocket connection
  const { connected, subscribe } = useWebSocket(user?.id);

  // Fetch initial data
  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch recent notifications
        const notifRes = await fetch(`${API_URL}/notifications/recent/${user.id}`);
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          setNotifications(notifData.notifications || []);
        }

        // Fetch unread count
        const countRes = await fetch(`${API_URL}/notifications/unread-count/${user.id}`);
        if (countRes.ok) {
          const countData = await countRes.json();
          setUnreadCount(countData.unreadCount || 0);
        }

        // Fetch city stats
        const cityRes = await fetch(`${API_URL}/city-stats/top?limit=10`);
        if (cityRes.ok) {
          const cityData = await cityRes.json();
          setCityStats(cityData.topCities || []);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  // Subscribe to WebSocket updates
  useEffect(() => {
    if (!connected || !user?.id) return;

    // Subscribe to user-specific notifications
    const notifSub = subscribe(`/user/${user.id}/notifications`, (notification) => {
      console.log('Received notification:', notification);

      // Add to notifications list
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show toast based on type
      const fromName = notification.fromUserName || 'Someone';
      switch (notification.type) {
        case 'LIKE_RECEIVED':
          toast.success(`${fromName} liked you!`, { icon: '❤️', duration: 5000 });
          break;
        case 'NEW_MATCH':
          toast.success(`You matched with ${fromName}!`, { icon: '🎉', duration: 5000 });
          break;
        case 'UNMATCH':
          toast(`${fromName} unmatched with you`, { icon: '💔', duration: 4000 });
          break;
      }
    });

    // Subscribe to global city stats
    const citySub = subscribe('/topic/city-stats', (stats) => {
      console.log('Received city stats update:', stats);
      setCityStats(stats.topCities || []);
    });

    return () => {
      if (notifSub) notifSub.unsubscribe();
      if (citySub) citySub.unsubscribe();
    };
  }, [connected, user?.id, subscribe]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const res = await fetch(`${API_URL}/notifications/mark-read/${notificationId}`, {
        method: 'PUT',
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications/mark-all-read/${user.id}`, {
        method: 'PUT',
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true }))
        );
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'LIKE_RECEIVED':
        return <Heart className="size-5 text-pink-500 fill-pink-500" />;
      case 'NEW_MATCH':
        return <Sparkles className="size-5 text-emerald-500" />;
      case 'UNMATCH':
        return <UserMinus className="size-5 text-base-content/50" />;
      default:
        return <Bell className="size-5 text-base-content/50" />;
    }
  };

  // Get notification text
  const getNotificationText = (notification) => {
    const fromName = notification.fromUserName || 'Someone';
    switch (notification.type) {
      case 'LIKE_RECEIVED':
        return `${fromName} liked you`;
      case 'NEW_MATCH':
        return `You matched with ${fromName}!`;
      case 'UNMATCH':
        return `${fromName} unmatched with you`;
      default:
        return 'New notification';
    }
  };

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-base-200/30 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to view your dashboard</h2>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200/30 font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary tracking-tight">
            Dashboard
          </h1>
          <p className="text-base-content/60 mt-1">
            Welcome back, {user?.firstName || 'there'}! Here's what's happening.
          </p>

          {/* Connection Status */}
          <div className="mt-2 flex items-center gap-2">
            <div className={`size-2 rounded-full ${connected ? 'bg-success' : 'bg-error'}`}></div>
            <span className="text-xs text-base-content/50">
              {connected ? 'Connected' : 'Disconnected'} - Real-time updates {connected ? 'enabled' : 'disabled'}
            </span>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications Panel */}
          <div className="bg-base-100 rounded-2xl shadow-lg border border-base-200 overflow-hidden">
            {/* Panel Header */}
            <div className="p-6 border-b border-base-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Bell className="size-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Notifications</h2>
                  <p className="text-xs text-base-content/60">Recent activity (last 48 hours)</p>
                </div>
              </div>
              {unreadCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="badge badge-primary badge-sm">{unreadCount} new</div>
                  <button
                    onClick={markAllAsRead}
                    className="btn btn-ghost btn-xs"
                  >
                    Mark all read
                  </button>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-[500px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="size-12 text-base-content/20 mx-auto mb-3" />
                  <p className="text-base-content/50">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-base-200">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                      className={`p-4 flex items-start gap-3 hover:bg-base-200/50 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-primary/5' : ''
                      }`}
                    >
                      {/* Avatar */}
                      <img
                        src={
                          notification.fromUserImageUrl ||
                          `https://ui-avatars.com/api/?name=${notification.fromUserName}`
                        }
                        alt={notification.fromUserName}
                        className="size-10 rounded-full object-cover"
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium">
                            {getNotificationText(notification)}
                          </p>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <p className="text-xs text-base-content/50 mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>

                      {/* Unread Indicator */}
                      {!notification.read && (
                        <div className="size-2 bg-primary rounded-full shrink-0 mt-1"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* View All Button */}
            {notifications.length > 0 && (
              <div className="p-4 border-t border-base-200">
                <button
                  onClick={() => navigate('/notifications-history')}
                  className="btn btn-block btn-ghost btn-sm"
                >
                  View All Notifications
                </button>
              </div>
            )}
          </div>

          {/* City Statistics Panel */}
          <div className="bg-base-100 rounded-2xl shadow-lg border border-base-200 overflow-hidden">
            {/* Panel Header */}
            <div className="p-6 border-b border-base-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-secondary/10 p-2 rounded-lg">
                  <MapPin className="size-5 text-secondary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Top Cities</h2>
                  <p className="text-xs text-base-content/60">
                    Where people are looking for roommates
                  </p>
                </div>
              </div>
              <TrendingUp className="size-5 text-base-content/30" />
            </div>

            {/* City Stats List */}
            <div className="max-h-[500px] overflow-y-auto p-6">
              {loading ? (
                <div className="text-center py-8">
                  <span className="loading loading-spinner loading-lg text-secondary"></span>
                </div>
              ) : cityStats.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="size-12 text-base-content/20 mx-auto mb-3" />
                  <p className="text-base-content/50">No city data available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cityStats.map((city, index) => {
                    const maxCount = cityStats[0]?.count || 1;
                    const percentage = (city.count / maxCount) * 100;

                    return (
                      <div
                        key={city.city}
                        className="group hover:bg-base-200/50 p-3 rounded-xl transition-colors"
                      >
                        {/* City Rank & Name */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div
                              className={`size-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                index === 0
                                  ? 'bg-yellow-500 text-white'
                                  : index === 1
                                  ? 'bg-gray-400 text-white'
                                  : index === 2
                                  ? 'bg-orange-600 text-white'
                                  : 'bg-base-200 text-base-content/70'
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-bold text-base-content">
                                {city.city}
                              </p>
                              <p className="text-xs text-base-content/50">
                                {city.count} {city.count === 1 ? 'user' : 'users'}
                              </p>
                            </div>
                          </div>

                          {/* Count Badge */}
                          <div className="badge badge-secondary badge-lg font-bold">
                            {city.count}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-base-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-secondary to-accent h-full transition-all duration-500 ease-out"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/explore')}
            className="btn btn-outline btn-lg rounded-xl gap-2"
          >
            <Users className="size-5" />
            Explore Matches
          </button>
          <button
            onClick={() => navigate('/matches')}
            className="btn btn-outline btn-lg rounded-xl gap-2"
          >
            <Heart className="size-5" />
            View Matches
          </button>
          <button
            onClick={() => navigate(`/user/${user.id}`)}
            className="btn btn-outline btn-lg rounded-xl gap-2"
          >
            <Users className="size-5" />
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
