import { useEffect, useState, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router';
import Navbar from '../components/Navbar';
import { 
  Bell, MapPin, TrendingUp, Heart, 
  Sparkles, Eye, X, Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useWebSocket } from '../hooks/useWebSocket';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// --- Sub-Components ---

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
  <div className="bg-base-100 p-6 rounded-2xl shadow-sm border border-base-200 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-base-content/60">{title}</p>
      <h3 className="text-3xl font-black mt-1 text-base-content">{value}</h3>
      {subtext && <p className="text-xs font-medium text-base-content/40 mt-1">{subtext}</p>}
    </div>
    <div className={`p-4 rounded-xl ${color} bg-opacity-10`}>
      <Icon className={`size-8 ${color.replace('bg-', 'text-')}`} />
    </div>
  </div>
);

const SkeletonLoader = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-base-300 rounded w-3/4"></div>
    <div className="h-4 bg-base-300 rounded w-1/2"></div>
    <div className="h-12 bg-base-300 rounded w-full mt-4"></div>
  </div>
);

// --- Main Dashboard Page ---

function DashboardPage() {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [cityStats, setCityStats] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Simulated data (Replace with real API)
  const [stats, setStats] = useState({ views: 0 });
  // In a real app, this comes from user.publicMetadata.lookingIn or similar
  const currentSearchCity = "Austin, TX"; 

  const { connected, subscribe } = useWebSocket(user?.id);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [notifRes, countRes, cityRes] = await Promise.all([
          fetch(`${API_URL}/notifications/recent/${user.id}`),
          fetch(`${API_URL}/notifications/unread-count/${user.id}`),
          // Increased limit to 10 to make the panel larger/taller
          fetch(`${API_URL}/city-stats/top?limit=10`) 
        ]);

        if (notifRes.ok) {
          const data = await notifRes.json();
          setNotifications(data.notifications || []);
        }
        if (countRes.ok) {
          const data = await countRes.json();
          setUnreadCount(data.unreadCount || 0);
        }
        if (cityRes.ok) {
          const data = await cityRes.json();
          setCityStats(data.topCities || []);
        }

        setStats({ views: 45 });

      } catch (error) {
        console.error('Dashboard load failed:', error);
        toast.error('Could not load latest updates');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  useEffect(() => {
    if (!connected || !user?.id) return;

    const notifSub = subscribe(`/user/${user.id}/notifications`, (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      toast('New activity on your profile', { icon: '🔔' });
    });

    const citySub = subscribe('/topic/city-stats', (data) => {
      if(data?.topCities) setCityStats(data.topCities);
    });

    return () => {
      notifSub?.unsubscribe();
      citySub?.unsubscribe();
    };
  }, [connected, user?.id, subscribe]);

  const markAsRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await fetch(`${API_URL}/notifications/mark-read/${id}`, { method: 'PUT' });
    } catch (e) { console.error(e); }
  };

  const getNotificationConfig = (type) => {
    switch (type) {
      case 'LIKE_RECEIVED': return { icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500' };
      case 'NEW_MATCH': return { icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-500' };
      case 'UNMATCH': return { icon: X, color: 'text-error', bg: 'bg-error' };
      default: return { icon: Bell, color: 'text-primary', bg: 'bg-primary' };
    }
  };

  if (!isSignedIn) return null; 

  return (
    <div className="min-h-screen bg-base-200/50 font-sans pb-12">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-base-content tracking-tight">
              {greeting}, {user?.firstName}!
            </h1>
            <p className="text-base-content/60 mt-1">
              Welcome back to your roommate finder dashboard.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-base-100 rounded-full border border-base-200 shadow-sm text-xs font-medium">
            <div className={`size-2 rounded-full ${connected ? 'bg-success animate-pulse' : 'bg-error'}`} />
            <span className="text-base-content/70">
              System {connected ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Top KPI Grid (Modified) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Profile Views (Kept) */}
          <StatCard 
            title="Profile Views" 
            value={stats.views} 
            icon={Eye} 
            color="bg-blue-500" 
            subtext="Last 7 days"
          />
          
          {/* Card 2: Current Search Target (Replaced Active Cities) */}
          <StatCard 
            title="Searching In" 
            value={currentSearchCity} 
            icon={Search} 
            color="bg-primary" 
            subtext="Target Location"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Column: Notifications (Span 2) */}
          <div className="xl:col-span-2">
            <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 overflow-hidden h-full flex flex-col min-h-[600px]">
              <div className="p-6 border-b border-base-200 flex justify-between items-center bg-base-100/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">Activity Feed</h2>
                  {unreadCount > 0 && <span className="badge badge-primary badge-sm">{unreadCount} new</span>}
                </div>
                <button onClick={() => navigate('/notifications')} className="btn btn-ghost btn-xs">View History</button>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {loading ? (
                   <div className="p-6 space-y-4"><SkeletonLoader /><SkeletonLoader /></div>
                ) : notifications.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-base-content/40">
                    <div className="p-4 bg-base-200 rounded-full mb-3"><Bell className="size-8" /></div>
                    <p>No recent activity.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notifications.map((notif) => {
                      const { icon: Icon, color, bg } = getNotificationConfig(notif.type);
                      return (
                        <div 
                          key={notif.id}
                          onClick={() => !notif.read && markAsRead(notif.id)}
                          className={`group p-4 rounded-xl flex items-start gap-4 transition-all cursor-pointer border border-transparent hover:border-base-200 hover:bg-base-200/30 ${!notif.read ? 'bg-primary/5' : ''}`}
                        >
                          <div className={`mt-1 p-2 rounded-full shrink-0 ${bg} bg-opacity-10`}>
                            <Icon className={`size-4 ${color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <p className={`text-sm ${!notif.read ? 'font-semibold text-base-content' : 'font-medium text-base-content/70'}`}>
                                {notif.type === 'NEW_MATCH' ? 'New Match Found!' : notif.type === 'LIKE_RECEIVED' ? 'New Like Received' : 'Notification'}
                              </p>
                              <span className="text-[10px] text-base-content/40 whitespace-nowrap ml-2">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                              </span>
                            </div>
                            <p className="text-sm text-base-content/60 mt-0.5 truncate">
                              {notif.fromUserName || 'Someone'} interacted with your profile.
                            </p>
                          </div>
                          {!notif.read && <div className="size-2 bg-primary rounded-full mt-2" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Popular Cities (Expanded) */}
          <div className="xl:col-span-1">
            <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 p-6 h-full flex flex-col">
              <div className="mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <TrendingUp className="size-5 text-secondary" /> Popular Cities
                </h3>
                <p className="text-xs text-base-content/50 mt-1">Trending roommate searches this week</p>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                  <SkeletonLoader />
                ) : (
                  <div className="space-y-5">
                    {cityStats.map((city, idx) => (
                      <div key={city.city} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <span className={`font-mono text-xs w-6 h-6 flex items-center justify-center rounded bg-base-200 text-base-content/60 ${idx < 3 ? 'font-bold text-secondary bg-secondary/10' : ''}`}>
                              {idx + 1}
                            </span>
                            <span className="font-medium">{city.city}</span>
                          </div>
                          <span className="text-base-content/50 text-xs font-mono">{city.count}</span>
                        </div>
                        <progress 
                          className="progress progress-secondary w-full h-1.5 opacity-70" 
                          value={city.count} 
                          max={cityStats[0]?.count || 100}
                        ></progress>
                      </div>
                    ))}
                    {cityStats.length === 0 && <p className="text-sm text-base-content/50 text-center py-10">No city data available.</p>}
                  </div>
                )}
              </div>
              
              <div className="pt-6 border-t border-base-200 mt-4">
                 <button onClick={() => navigate('/explore')} className="btn btn-outline btn-sm btn-block text-xs">
                    Explore all locations
                 </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default DashboardPage;