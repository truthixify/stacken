import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth, useAccount } from '@micro-stacks/react';
import { Menu, X, Plus, User, LogOut } from 'lucide-react';
import useUserInfo from '../hooks/useUserInfo';

const Navbar: React.FC = () => {
  const { openAuthRequest, isSignedIn, signOut } = useAuth();
  const { stxAddress } = useAccount();
  const { displayName, userInfo } = useUserInfo();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleConnect = () => {
    openAuthRequest({
      onFinish: (payload) => {
        console.log('Auth finished:', payload);
      },
      onCancel: () => {
        console.log('Auth cancelled');
      }
    });
  };

  const handleSignOut = () => {
    signOut();
  };

  const truncateAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex items-center">
            <Link href="/">
              <a className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Stacken</span>
              </a>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link href="/campaigns">
                <a className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                  Campaigns
                </a>
              </Link>
              <Link href="/leaderboard">
                <a className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                  Leaderboard
                </a>
              </Link>
              <Link href="/about">
                <a className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                  About
                </a>
              </Link>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <>
                {/* Create Campaign Button */}
                <Link href="/campaigns/create">
                  <a className="hidden md:flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                    <Plus size={16} />
                    <span>Create Campaign</span>
                  </a>
                </Link>

                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                    {userInfo?.avatar ? (
                      <img
                        src={userInfo.avatar}
                        alt={displayName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <User size={16} />
                    )}
                    <span className="hidden md:block">{displayName || 'Wallet'}</span>
                  </button>
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link href={`/profile/${stxAddress || 'me'}`}>
                        <a className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <User size={16} />
                          <span>Profile</span>
                        </a>
                      </Link>
                      <Link href="/dashboard">
                        <a className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <span>Dashboard</span>
                        </a>
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <button
                onClick={handleConnect}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Connect Wallet
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-gray-100"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/campaigns">
                <a className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-lg">
                  Campaigns
                </a>
              </Link>
              <Link href="/leaderboard">
                <a className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-lg">
                  Leaderboard
                </a>
              </Link>
              <Link href="/about">
                <a className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-lg">
                  About
                </a>
              </Link>
              {isSignedIn && (
                <Link href="/campaigns/create">
                  <a className="block px-3 py-2 bg-primary-600 text-white rounded-lg">
                    Create Campaign
                  </a>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;