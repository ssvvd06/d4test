import React from 'react';
import { Shield, AlertTriangle, AlertCircle, Info, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Advisory {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  date: string;
  description: string;
  affected_systems: string[];
}

const getSeverityIcon = (severity: Advisory['severity']) => {
  switch (severity) {
    case 'critical':
      return <AlertTriangle className="w-6 h-6 text-red-600" />;
    case 'high':
      return <AlertCircle className="w-6 h-6 text-orange-500" />;
    case 'medium':
      return <Shield className="w-6 h-6 text-yellow-500" />;
    case 'low':
      return <Info className="w-6 h-6 text-blue-500" />;
  }
};

const getSeverityClass = (severity: Advisory['severity']) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-blue-100 text-blue-800';
  }
};

export default function AdvisoriesList() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [advisories, setAdvisories] = React.useState<Advisory[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchAdvisories();
  }, []);

  const fetchAdvisories = async () => {
    try {
      const { data, error } = await supabase
        .from('advisories')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setAdvisories(data || []);
    } catch (error) {
      console.error('Error fetching advisories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAdvisories = advisories.filter(advisory =>
    advisory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advisory.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="relative max-w-lg mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search advisories..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredAdvisories.map((advisory) => (
          <div
            key={advisory.id}
            className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {getSeverityIcon(advisory.severity)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {advisory.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {advisory.id} • {new Date(advisory.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityClass(advisory.severity)}`}>
                  {advisory.severity.charAt(0).toUpperCase() + advisory.severity.slice(1)}
                </span>
              </div>
              <p className="mt-4 text-gray-600">
                {advisory.description}
              </p>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">Affected Systems:</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {advisory.affected_systems.map((system) => (
                    <span
                      key={system}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                    >
                      {system}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}