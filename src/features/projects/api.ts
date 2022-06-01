import { api as generatedApi } from '../../app/api/generated';

export const api = generatedApi.enhanceEndpoints({
  addTagTypes: ['Tracking'],
  endpoints: {
    getTrackings: {
      providesTags: (result) => (
        result
          ? [
            ...result.getTrackings.items.map((tracking) => ({
              type: 'Tracking' as const,
              id: tracking.id,
            })), 'Tracking',
          ]
          : ['Tracking']
      ),
    },
    createTracking: {
      invalidatesTags: () => ['Tracking'],
    },
  },
});

export const { useGetTrackingsQuery } = api;
