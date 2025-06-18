import { User, Briefcase, Heart, Mail, Settings } from 'lucide-react'

interface ProfileSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  username?: string
}

export default function ProfileSidebar({ activeSection, onSectionChange, username }: ProfileSidebarProps) {
  const sections = [
    {
      id: 'personal',
      label: 'Personal Info',
      icon: User
    },
    {
      id: 'professional',
      label: 'Professional',
      icon: Briefcase
    },
    {
      id: 'interests',
      label: 'Skills & Interests',
      icon: Heart
    },
    {
      id: 'account',
      label: 'Account Info',
      icon: Mail
    }
  ]

  return (
    <div className="w-64 p-6">
      <div className="mb-6">
        <div className="text-xs font-semibold text-enostics-gray-500 uppercase tracking-wider mb-4">
          General
        </div>
      </div>

      <nav className="space-y-1">
        {sections.map((section) => {
          const Icon = section.icon
          const isActive = activeSection === section.id
          
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-enostics-purple/20 border border-enostics-purple/30 text-white'
                  : 'hover:bg-enostics-gray-800 text-enostics-gray-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${
                  isActive ? 'text-enostics-purple' : 'text-enostics-gray-400'
                }`} />
                <div className="font-medium">{section.label}</div>
              </div>
            </button>
          )
        })}
      </nav>
    </div>
  )
} 