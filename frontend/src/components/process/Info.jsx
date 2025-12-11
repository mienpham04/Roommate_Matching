import { useState } from "react";
import { useNavigate } from "react-router";
import {
  User,
  Mail,
  Calendar,
  VenusAndMars,
  CheckCircle2,
  Check,
  PenLine
} from "lucide-react";

const Info = ({ dbUser, id }) => {
  const navigate = useNavigate();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirm = () => {
    setIsConfirmed(true);
  };

  const handleModify = () => {
    navigate(`/user/${id}`);
  };

  const FieldDisplay = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-4 p-4 bg-base-200/40 rounded-2xl border border-transparent hover:border-base-300 hover:bg-base-200/70 transition-all group">
      <div className="w-10 h-10 rounded-xl bg-white text-pink-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest mb-0.5">
          {label}
        </p>
        <p className="text-sm font-semibold text-base-content truncate">
          {value || <span className="text-base-content/30 italic">Not set</span>}
        </p>
      </div>
    </div>
  );

  if (isConfirmed) {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-500 py-10">
        <div className="relative">
             <div className="absolute inset-0 bg-green-400 blur-2xl opacity-20 rounded-full animate-pulse"></div>
             <div className="w-24 h-24 bg-gradient-to-tr from-green-400 to-emerald-600 text-white rounded-full flex items-center justify-center shadow-xl relative z-10 mb-6">
                <CheckCircle2 size={48} strokeWidth={3} />
             </div>
        </div>
        
        <h3 className="text-2xl font-black text-base-content mb-2">You're All Set!</h3>
        <p className="text-base-content/60 text-center max-w-sm leading-relaxed mb-8">
            Thanks, <span className="font-bold text-pink-500">{dbUser?.firstName}</span>. Your details have been verified and locked for the matching algorithm.
        </p>
        <button onClick={() => setIsConfirmed(false)} className="btn btn-sm btn-ghost text-base-content/40 hover:text-base-content">
            Undo confirmation
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            Confirm Details
          </h2>
          <p className="text-sm text-base-content/60 mt-1">Review your contact card before we proceed.</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-base-100 rounded-3xl p-1 shadow-sm border border-base-200">
        <div className="bg-base-200/30 rounded-[1.4rem] p-6 sm:p-8">
            
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 text-center sm:text-left">
                <div className="avatar">
                    <div className="w-24 rounded-full ring-4 ring-white shadow-xl">
                        <img src={dbUser?.profileImageUrl} alt="Profile" />
                    </div>
                </div>
                <div className="mt-2">
                    <h3 className="text-2xl font-bold">{dbUser?.firstName} {dbUser?.lastName}</h3>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                        <div className="badge border-2 border-pink-400 text-pink-600 bg-pink-50 font-semibold gap-1 pl-1 pr-3 py-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div>
                           Personal Info
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FieldDisplay icon={User} label="Full Name" value={`${dbUser?.firstName} ${dbUser?.lastName}`} />
                <FieldDisplay icon={VenusAndMars} label="Gender" value={dbUser?.gender} />
                <FieldDisplay icon={Calendar} label="Birthday" value={dbUser?.dateOfBirth} />
                <FieldDisplay icon={Mail} label="Email" value={dbUser?.email} />
            </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <button
          onClick={handleModify}
          className="btn btn-ghost bg-base-100 border border-base-200 hover:border-base-300 hover:bg-base-200 text-base-content/70"
        >
          <PenLine className="w-4 h-4 mr-2" />
          Edit Profile
        </button>

        <button
          onClick={handleConfirm}
          className="btn bg-teal-400 hover:bg-teal-500 border-0 text-gray-900 shadow-lg shadow-teal-300/30 hover:scale-[1.02] transition-transform font-extrabold"
        >
          <Check className="w-4 h-4 mr-2" strokeWidth={3} />
          Confirm & Continue
        </button>
      </div>

    </div>
  );
};

export default Info;