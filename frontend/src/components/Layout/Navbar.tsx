import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
}

const navigation: NavigationItem[] = [
  { name: 'Home', href: '/' },
  { name: 'Confessions', href: '/confessions' },
];

const UserAvatar: React.FC<{ username: string }> = ({ username }) => (
  <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
    {username[0].toUpperCase()}
  </div>
);

const UserMenu: React.FC<{ username: string; onLogout: () => void }> = ({ username, onLogout }) => (
  <Menu as="div" className="relative ml-3">
    <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
      <span className="sr-only">Open user menu</span>
      <UserAvatar username={username} />
    </Menu.Button>
    <Transition
      enter="transition ease-out duration-200"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <Menu.Item>
          {({ active }: { active: boolean }) => (
            <Link
              to={`/profile/${username}`}
              className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
            >
              Your Profile
            </Link>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }: { active: boolean }) => (
            <Link
              to="/subscription"
              className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
            >
              Subscription
            </Link>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }: { active: boolean }) => (
            <button
              onClick={onLogout}
              className={`${active ? 'bg-gray-100' : ''} block w-full px-4 py-2 text-left text-sm text-gray-700`}
            >
              Sign out
            </button>
          )}
        </Menu.Item>
      </Menu.Items>
    </Transition>
  </Menu>
);

const AuthButtons: React.FC = () => (
  <div className="flex space-x-4">
    <Link
      to="/login"
      className="rounded-md bg-white px-4 py-2 text-sm font-medium text-primary-600 hover:bg-gray-50"
    >
      Sign in
    </Link>
    <Link
      to="/register"
      className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
    >
      Get Started
    </Link>
  </div>
);

const MobileMenu: React.FC<{
  user: { username: string; collegeName: string } | null;
  onLogout: () => void;
}> = ({ user, onLogout }) => (
  <Disclosure.Panel className="sm:hidden">
    <div className="space-y-1 pb-3 pt-2">
      {navigation.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-primary-500 hover:bg-gray-50 hover:text-gray-700"
        >
          {item.name}
        </Link>
      ))}
    </div>
    {user ? (
      <div className="border-t border-gray-200 pb-3 pt-4">
        <div className="flex items-center px-4">
          <UserAvatar username={user.username} />
          <div className="ml-3">
            <div className="text-base font-medium text-gray-800">{user.username}</div>
            <div className="text-sm font-medium text-gray-500">{user.collegeName}</div>
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <Link
            to={`/profile/${user.username}`}
            className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            Your Profile
          </Link>
          <Link
            to="/subscription"
            className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            Subscription
          </Link>
          <button
            onClick={onLogout}
            className="block w-full px-4 py-2 text-left text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            Sign out
          </button>
        </div>
      </div>
    ) : (
      <div className="border-t border-gray-200 pb-3 pt-4">
        <div className="mt-3 space-y-1">
          <Link
            to="/login"
            className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            Get Started
          </Link>
        </div>
      </div>
    )}
  </Disclosure.Panel>
);

const Navbar: React.FC = () => {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-32 animate-pulse bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }: { open: boolean }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Link to="/" className="text-2xl font-bold text-primary-600">
                    Campus Confessions
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-primary-500 hover:text-gray-700"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {user ? (
                  <UserMenu username={user.username} onLogout={logout} />
                ) : (
                  <AuthButtons />
                )}
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>
          <MobileMenu user={user} onLogout={logout} />
        </>
      )}
    </Disclosure>
  );
};

export default Navbar; 