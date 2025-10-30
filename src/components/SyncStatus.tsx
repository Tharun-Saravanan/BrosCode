// Real-time Sync Status Component
import React, { useState, useEffect } from 'react';
import { ProductService } from '../services/productService';

interface SyncStatusProps {
  className?: string;
}

const SyncStatus: React.FC<SyncStatusProps> = ({ className = '' }) => {
  const [syncStatus, setSyncStatus] = useState({
    isOnline: true,
    lastSyncTime: 0,
    activeSubscriptions: 0,
    syncEnabled: true,
  });

  useEffect(() => {
    // Update sync status every 5 seconds
    const updateStatus = () => {
      setSyncStatus(ProductService.getSyncStatus());
    };

    // Initial update
    updateStatus();

    // Set up interval
    const interval = setInterval(updateStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatLastSync = (timestamp: number): string => {
    if (timestamp === 0) return 'Never';
    
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const getStatusColor = (): string => {
    if (!syncStatus.syncEnabled) return 'text-gray-500';
    if (!syncStatus.isOnline) return 'text-red-500';
    if (syncStatus.activeSubscriptions > 0) return 'text-green-500';
    return 'text-yellow-500';
  };

  const getStatusIcon = (): string => {
    if (!syncStatus.syncEnabled) return '⏸️';
    if (!syncStatus.isOnline) return '📴';
    if (syncStatus.activeSubscriptions > 0) return '🔄';
    return '⏹️';
  };

  const getStatusText = (): string => {
    if (!syncStatus.syncEnabled) return 'Sync Disabled';
    if (!syncStatus.isOnline) return 'Offline';
    if (syncStatus.activeSubscriptions > 0) return 'Syncing';
    return 'Idle';
  };

  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      <span className={`${getStatusColor()}`}>
        {getStatusIcon()}
      </span>
      <span className={`${getStatusColor()} font-medium`}>
        {getStatusText()}
      </span>
      {syncStatus.lastSyncTime > 0 && (
        <span className="text-gray-500">
          • Last sync: {formatLastSync(syncStatus.lastSyncTime)}
        </span>
      )}
      {syncStatus.activeSubscriptions > 0 && (
        <span className="text-gray-500">
          • {syncStatus.activeSubscriptions} active
        </span>
      )}
    </div>
  );
};

export default SyncStatus;
