
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface TrackingEvent {
  id: string;
  event_type: string;
  description: string;
  location: string | null;
  created_at: string;
  shipment_id: string;
}

export const useRealtimeTracking = (shipmentId?: string) => {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log('Setting up realtime tracking subscription...');
    
    const channel = supabase
      .channel('tracking-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tracking_events',
          ...(shipmentId && { filter: `shipment_id=eq.${shipmentId}` })
        },
        (payload) => {
          console.log('New tracking event received:', payload);
          
          // Invalidate and refetch relevant queries
          queryClient.invalidateQueries({ queryKey: ['shipments'] });
          queryClient.invalidateQueries({ queryKey: ['user-shipments'] });
          queryClient.invalidateQueries({ queryKey: ['shipment-details'] });
          
          // If we have a specific shipment, also invalidate its details
          if (shipmentId) {
            queryClient.invalidateQueries({ queryKey: ['shipment-details', shipmentId] });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shipments',
          ...(shipmentId && { filter: `id=eq.${shipmentId}` })
        },
        (payload) => {
          console.log('Shipment updated:', payload);
          
          // Invalidate shipment queries
          queryClient.invalidateQueries({ queryKey: ['shipments'] });
          queryClient.invalidateQueries({ queryKey: ['user-shipments'] });
          queryClient.invalidateQueries({ queryKey: ['shipment-details'] });
          
          if (shipmentId) {
            queryClient.invalidateQueries({ queryKey: ['shipment-details', shipmentId] });
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [shipmentId, queryClient]);

  return { isConnected };
};
