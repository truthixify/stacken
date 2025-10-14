'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth, useAccount } from '@micro-stacks/react';
import useUserInfo from '../hooks/useUserInfo';
import UserAvatar from './UserAvatar';
import Logo from '../assets/stacken.svg';

const truncateAddress = (address: string) =>
  address ? `${address.slice(0, 5)}...${address.slice(-4)}` : '';

const Navbar: React.FC = () => {
  const { openAuthRequest, isSignedIn, signOut } = useAuth();
  const { stxAddress } = useAccount();
  const { displayName, userInfo } = useUserInfo();

  const [mounted, setMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleConnect = () => {
    openAuthRequest({
      onFinish: payload => console.log('Auth finished:', payload),
      onCancel: () => console.log('Auth cancelled'),
    });
  };

  const handleSignOut = () => signOut();

  const userLabel = displayName || (stxAddress ? truncateAddress(stxAddress) : 'Wallet');

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl px-4 py-4 rounded-2xl border border-[#FFCBAD40] bg-white/5 backdrop-blur-md shadow-[0_0_40px_rgba(255,255,255,0.25)_inset]">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image
                src={Logo}
                alt="Stacken Logo"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <span className="text-white text-base font-bold leading-tight cursor-pointer">
              Stacken
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          <Link
            href="/missions"
            className="text-white text-sm font-medium hover:text-orange-400 transition"
          >
            Discover Missions
          </Link>
          <Link
            href="/leaderboard"
            className="text-white text-sm font-medium hover:text-orange-400 transition"
          >
            Top Builders
          </Link>
          <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
            Our Story
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {mounted && isSignedIn ? (
            <div className="relative">
              {/* Avatar + Dropdown Toggle */}
              <button
                onClick={() => setIsDropdownOpen(prev => !prev)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:none transition"
              >
                <UserAvatar
                  userAddress={stxAddress || ''}
                  avatar={userInfo?.avatar}
                  displayName={displayName}
                  size={32}
                />
                <span className="hidden md:block text-white text-sm font-medium">{userLabel}</span>
              </button>

              {/* Dropdown */}
              <div
                className={`absolute right-0 mt-6 w-48 bg-red/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg transition-all duration-200 z-50 mb-6 ${
                  isDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
              >
                <div className="py-2">
                  <Link href={`/profile/${stxAddress || 'me'}`} className="block">
                    <div className="flex items-center gap-2 px-4 py-2 text-sm text-white/90 hover:none rounded-lg transition cursor-pointer">
                      <UserAvatar
                        userAddress={stxAddress || ''}
                        avatar={userInfo?.avatar}
                        displayName={displayName}
                        size={24}
                      />
                      <span>My Profile</span>
                    </div>
                  </Link>
                  <hr className="border-white/20 my-1" />
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-lg transition"
                  >
                    <LogOut size={14} />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>
            </div>
          ) : mounted ? (
            <button
              onClick={handleConnect}
              className="px-4 py-2 text-white bg-orange-600 hover:bg-orange-500 rounded-lg text-sm font-semibold transition border border-white/20"
            >
              Connect Wallet
            </button>
          ) : (
            <button
              disabled
              className="px-4 py-2 text-gray-400 bg-gray-700 rounded-lg text-sm font-semibold"
            >
              Connect Wallet
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            className="md:hidden p-2 text-gray-300 hover:text-orange-400"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 border-t border-gray-800 pt-3">
          <div className="flex flex-col gap-4">
            <Link
              href="/missions"
              className="text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-800 hover:text-orange-400 transition"
            >
              Discover Missions
            </Link>
            <Link
              href="/leaderboard"
              className="text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-800 hover:text-orange-400 transition"
            >
              Top Builders
            </Link>
            <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
              Our Story
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
