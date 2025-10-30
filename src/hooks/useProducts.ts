import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setProducts, setLoading } from '../store/productSlice';
import { ProductService } from '../services';

export const useProducts = () => {
  const dispatch = useAppDispatch();
  const { products, loading, error } = useAppSelector((state) => state.products);

  useEffect(() => {
    dispatch(setLoading(true));

    // Set up real-time listener for products
    const unsubscribe = ProductService.subscribeToProducts((updatedProducts) => {
      dispatch(setProducts(updatedProducts));
      dispatch(setLoading(false));
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  return {
    products,
    loading,
    error,
  };
};

export const useFeaturedProducts = (limit: number = 8) => {
  const { products, loading, error } = useProducts();

  const featuredProducts = products.slice(0, limit);

  return {
    products: featuredProducts,
    loading,
    error,
  };
};
