import { useState } from "react";
import { useNavigate } from "react-router";
import {
  User,
  Mail,
  Calendar,
  VenusAndMars,
  CheckCircle2,
  Check,
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
    <div className="flex items-start gap-3 p-3 bg-base-100 rounded-xl border border-base-200/60 shadow-sm hover:border-primary/30 transition-colors group">
      <div className="mt-1 p-2 bg-primary/5 text-primary rounded-lg group-hover:bg-primary/10 transition-colors">
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-base-content/50 uppercase tracking-wider mb-0.5">
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
      <div className="flex flex-col items-center justify-center h-full py-12 space-y-6 animate-fade-in-up">
        <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(74,222,128,0.2)]">
          <CheckCircle2 size={40} strokeWidth={3} />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">Profile Verified</h3>
          <p className="text-base-content/60 max-w-xs mx-auto">
            Thanks, {dbUser?.firstName}! Your details are locked in for the matching process.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Confirm Details</h2>
          <p className="text-xs text-base-content/60">Make sure your contact info is up to date.</p>
        </div>
      </div>

      <div className="bg-base-200/30 rounded-3xl p-6 border border-base-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-4 -mt-4 pointer-events-none"></div>

        <div className="flex flex-col gap-6 relative z-10">

          <div className="flex items-center gap-5">
            <div className="avatar">
              <div className="w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 shadow-lg">
                <img src={dbUser?.profileImageUrl} alt="Profile" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold">{dbUser?.firstName} {dbUser?.lastName}</h3>
              <div className="badge badge-sm badge-ghost mt-1 opacity-70">Personal Info</div>
            </div>
          </div>

          <div className="divider my-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            <FieldDisplay
              icon={User}
              label="Full Name"
              value={`${dbUser?.firstName} ${dbUser?.lastName}`}
            />

            <FieldDisplay
              icon={VenusAndMars}
              label="Gender"
              value={dbUser?.gender}
            />

            <FieldDisplay
              icon={Calendar}
              label="Birthday"
              value={dbUser?.dateOfBirth}
            />

            <FieldDisplay
              icon={Mail}
              label="Email"
              value={dbUser?.email}
            />

          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <button
          onClick={handleModify}
          className="btn btn-outline border-base-300 hover:border-base-content hover:bg-base-content hover:text-base-100 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          Update profile & preferences
        </button>

        <button
          onClick={handleConfirm}
          className="btn btn-primary text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
        >
          <Check className="w-4 h-4 mr-1" strokeWidth={2} />
          Yes, looks good
        </button>
      </div>

    </div>
  );
};

export default Info;