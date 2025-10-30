import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAppDispatch } from '../store/hooks';
import { loadCart } from '../store/cartSlice';

const CartInitializer: React.FC = () => {
  const { currentUser } = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Load appropriate cart based on user authentication state
    const userId = currentUser?.uid || null;
    console.log('🛒 CartInitializer: Loading cart for user:', userId || 'guest');
    dispatch(loadCart(userId));
  }, [currentUser?.uid, dispatch]);

  return null; // This component doesn't render anything
};

export default CartInitializer;
