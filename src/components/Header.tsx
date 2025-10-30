import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { toggleCart } from '../store/cartSlice'

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { currentUser, logout } = useAuth();
    const { totalItems } = useAppSelector((state) => state.cart);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const lastScrollY = useRef(0);
    const scrollTimeout = useRef<number | null>(null);

    useEffect(() => {
        const onScroll = () => {
            const currentY = window.scrollY || 0;

            if (currentY !== lastScrollY.current && currentY > 10) {
                // Scrolling (up or down)
                setIsHeaderVisible(false);
            } else {
                // At very top or no movement
                setIsHeaderVisible(true);
            }

            // Show when scrolling stops
            if (scrollTimeout.current) {
                window.clearTimeout(scrollTimeout.current);
            }
            scrollTimeout.current = window.setTimeout(() => {
                setIsHeaderVisible(true);
            }, 180);

            lastScrollY.current = currentY;
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Failed to log out:', error);
        }
    };

    const getUserDisplayName = () => {
        if (currentUser?.displayName) {
            return currentUser.displayName.split(' ')[0]; // First name only
        }
        return currentUser?.email?.split('@')[0] || 'User';
    };

    const handleCartClick = () => {
        dispatch(toggleCart());
    };

    return (
        <header className={`fixed top-0 left-0 w-full z-50 bg-transparent transition-transform duration-300 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className='mx-auto w-full max-w-none px-8 py-4 md:py-6 flex justify-between items-center bg-white shadow-sm'>
                <Link to="/" className='text-2xl font-bold tracking-tighter'>Quick Snack</Link>

                <button className='md:hidden focus:outline-none'
                    onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <nav className='hidden md:flex gap-8'>
                    <Link to="/collections/new-arrivals" className='font-medium text-sm tracking-wide hover:text-gray-900 relative group uppercase'>
                        Suggested For You
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                    <Link to="/collections/best-sellers" className='font-medium text-sm tracking-wide hover:text-gray-900 relative group'>
                        BEST SELLERS
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
                    </Link>

                    <Link to="/collections/sandals" className='font-medium text-sm tracking-wide hover:text-gray-900 relative group uppercase'>
                        All Products
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                </nav>

                <div className='flex items-center gap-6'>
                    <button className="focus:outline-none hover:text-gray-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>

                    {currentUser ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-2 focus:outline-none hover:text-gray-600 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="hidden md:block text-sm font-medium">{getUserDisplayName()}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50 border">
                                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                                        <div className="font-medium">{getUserDisplayName()}</div>
                                        <div className="text-gray-500 truncate" title={currentUser.email || undefined}>{currentUser.email}</div>
                                    </div>
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        Profile
                                    </Link>
                                    <Link
                                        to="/purchase-history"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        Purchase History
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setIsUserMenuOpen(false);
                                            handleLogout();
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/signin" className="focus:outline-none hover:text-gray-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </Link>
                    )}

                    <button
                        onClick={handleCartClick}
                        className="relative focus:outline-none hover:text-gray-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {totalItems > 0 && (
                            <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                                {totalItems > 99 ? '99+' : totalItems}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className='md:hidden bg-transparent py-2 animate-fadeIn'>
                    <div className='mx-auto w-[95%] max-w-6xl bg-white border border-black rounded-2xl px-4 flex flex-col gap-4'>
                        <Link to="/collections/new-arrivals" className='font-medium py-2 hover:text-gray-900 border-b border-gray-100 pb-2'>NEW ARRIVALS</Link>
                        <Link to="/collections/best-sellers" className='font-medium py-2 hover:text-gray-900 border-b border-gray-100 pb-2'>BEST SELLERS</Link>
                        <Link to="/collections/shoes" className='font-medium py-2 hover:text-gray-900 border-b border-gray-100 pb-2'>SHOES</Link>
                        <Link to="/collections/sandals" className='font-medium py-2 hover:text-gray-900 border-b border-gray-100 pb-2'>SANDALS</Link>
                        {currentUser ? (
                            <>
                                <div className='font-medium py-2 border-b border-gray-100 pb-2 text-gray-700'>
                                    Welcome, {getUserDisplayName()}
                                </div>
                                <Link to="/profile" className='font-medium py-2 hover:text-gray-900 border-b border-gray-100 pb-2'>PROFILE</Link>
                                <Link to="/purchase-history" className='font-medium py-2 hover:text-gray-900 border-b border-gray-100 pb-2'>PURCHASE HISTORY</Link>
                                <button
                                    onClick={handleLogout}
                                    className='font-medium py-2 hover:text-gray-900 text-left w-full'
                                >
                                    SIGN OUT
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/signin" className='font-medium py-2 hover:text-gray-900 border-b border-gray-100 pb-2'>SIGN IN</Link>
                                <Link to="/signup" className='font-medium py-2 hover:text-gray-900'>SIGN UP</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}

export default Header