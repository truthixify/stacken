import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useRouter } from 'next/router';
import { useAuth } from '@micro-stacks/react';
import { Trophy, Users, Zap, Target, ArrowRight, TrendingUp, Award, Coins } from 'lucide-react';

const HomePage = () => {
  const router = useRouter();
  const { isSignedIn, openAuthRequest } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only showing auth-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGetStarted = () => {
    if (isSignedIn) {
      router.push('/missions');
    } else {
      openAuthRequest();
    }
  };

  const features = [
    {
      icon: <Trophy className="h-8 w-8 text-orange-600" />,
      title: 'Bounty Missions',
      description:
        'Launch challenges and tackle projects with transparent crypto rewards locked in smart contracts.',
    },
    {
      icon: <Users className="h-8 w-8 text-orange-600" />,
      title: 'Builder Community',
      description:
        'Join thousands of creators, developers, and innovators earning rewards for great work.',
    },
    {
      icon: <Zap className="h-8 w-8 text-orange-600" />,
      title: 'Instant Payouts',
      description:
        'Get paid in crypto the moment your work is approved — no waiting, no middlemen.',
    },
    {
      icon: <Target className="h-8 w-8 text-orange-600" />,
      title: 'Perfect Matches',
      description: 'Smart matching connects the right builders with the right missions every time.',
    },
  ];

  const stats = [
    { label: 'Active Missions', value: '150+', icon: <TrendingUp className="h-5 w-5" /> },
    { label: 'Builders Joined', value: '10K+', icon: <Users className="h-5 w-5" /> },
    { label: 'Rewards Distributed', value: '1M+', icon: <Coins className="h-5 w-5" /> },
    { label: 'Success Rate', value: '98%', icon: <Award className="h-5 w-5" /> },
  ];

  return (
    <Layout title="Stacken — Where Builders Meet Bounties">
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[url('/chrome.png')] bg-center bg-cover opacity-20">
            <div className="absolute top-0 right-0 w-[600px] h-[300px] bg-orange-500/5 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-b from-white to-orange-600 bg-clip-text text-transparent mb-8">
                Where Builders Meet Bounties<p>and Great Work Gets Rewarded</p>
              </h1>

              <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
                Launch bounty missions, showcase your skills, and earn crypto rewards on the most
                trusted blockchain — all powered by Stacks.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  variant="gradient"
                  onClick={handleGetStarted}
                  className="text-lg px-8 py-4 h-auto"
                >
                  {mounted
                    ? isSignedIn
                      ? 'Find Your Mission'
                      : 'Start Building Today'
                    : 'Start Building Today'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push('/leaderboard')}
                  className="text-lg px-8 py-4 h-auto border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  See Top Builders
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        {/* <section className="relative py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-2 text-orange-600">
                    {stat.icon}
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section> */}

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Why Builders Choose Stacken
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Every mission is a chance to showcase your skills, earn crypto, and build something
                amazing with the community.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="bg-gradient-to-r from-gray-500/10 to-gray-700/20 rounded-2xl p-2 border border-gray-600/20"
                >
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">{feature.icon}</div>
                    <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-400 text-center">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-12">
                  Ready to Start Earning?
                </h3>

                <div className="relative">
                  {/* Vertical connector line */}
                  <div className="absolute left-5 top-0 bottom-0 w-1 -translate-x-1/2 bg-gradient-to-b from-orange-500/60 via-gray-400/30 to-transparent" />

                  <div className="space-y-12 relative">
                    {/* Step 1 */}
                    <div className="flex items-start space-x-4 relative">
                      <div className="relative z-10 flex-shrink-0 w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        1
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-white mb-2">
                          Link Your Stacks Wallet
                        </h4>
                        <p className="text-gray-400">
                          Connect your wallet in seconds and join the builder community.
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start space-x-4 relative">
                      <div className="relative z-10 flex-shrink-0 w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        2
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-white mb-2">Find Your Mission</h4>
                        <p className="text-gray-400">
                          Browse active bounties and pick challenges that match your skills.
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start space-x-4 relative">
                      <div className="relative z-10 flex-shrink-0 w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        3
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-white mb-2">
                          Get Paid in Crypto
                        </h4>
                        <p className="text-gray-400">
                          Submit amazing work, get approved, and watch crypto rewards hit your
                          wallet.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-r from-gray-500/10 to-gray-700/20 rounded-2xl p-12 border border-gray-600/20">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Build Something Amazing?
              </h3>
              <p className="text-xl text-gray-400 mb-8">
                Join thousands of builders earning crypto for their skills. Launch bounties, tackle
                challenges, and get rewarded.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={() => router.push('/missions/create')}
                  className="text-lg px-8 py-4 h-auto"
                >
                  Launch a Bounty
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push('/missions')}
                  className="text-lg px-8 py-4 h-auto border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Find Missions
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HomePage;
