import React from 'react';
import { Map } from 'lucide-react';
import { useRouter } from '../../hooks/useRouter';
import { PageTransition } from './PageTransition';

export const ProgressionMap = () => {
  const { navigate } = useRouter();

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-teal-500 to-green-500 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white bg-opacity-90 p-8 rounded-xl text-center">
            <Map className="w-16 h-16 mx-auto mb-4 text-teal-600" />
            <h1 className="text-4xl font-bold mb-4">Progression Map</h1>
            <p className="text-gray-600 mb-8">Track your journey through the Mythic Cafe</p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((battle) => (
                <div 
                  key={battle}
                  className="bg-gray-200 p-6 rounded-lg"
                >
                  <div className="text-3xl mb-2">
                    {battle <= 3 ? '☕' : battle <= 6 ? '💼' : '📶'}
                  </div>
                  <div className="font-bold">Battle {battle}</div>
                  <div className="text-xs text-gray-600 mt-1">Locked</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/menu')}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-all"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};