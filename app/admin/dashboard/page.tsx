"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, AnnualReport } from '@/lib/supabase';
import {
    FileText,
    LogOut,
    Download,
    Search,
    Calendar,
    Building2,
    Mail,
    MapPin,
    FileSignature,
    Loader2,
    Filter
} from 'lucide-react';

export default function AdminDashboard() {
    const [reports, setReports] = useState<AnnualReport[]>([]);
    const [filteredReports, setFilteredReports] = useState<AnnualReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({ total: 0, today: 0, thisWeek: 0 });
    const router = useRouter();

    useEffect(() => {
        checkAuth();
        fetchReports();
    }, []);

    useEffect(() => {
        filterReports();
    }, [searchQuery, reports]);

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/admin');
        }
    };

    const fetchReports = async () => {
        try {
            const { data, error } = await supabase
                .from('annual_reports')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setReports(data || []);
            calculateStats(data || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data: AnnualReport[]) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const todayCount = data.filter(r => new Date(r.created_at) >= today).length;
        const weekCount = data.filter(r => new Date(r.created_at) >= weekAgo).length;

        setStats({
            total: data.length,
            today: todayCount,
            thisWeek: weekCount
        });
    };

    const filterReports = () => {
        if (!searchQuery.trim()) {
            setFilteredReports(reports);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = reports.filter(report =>
            report.business_name.toLowerCase().includes(query) ||
            report.email.toLowerCase().includes(query) ||
            report.address.toLowerCase().includes(query) ||
            report.signature.toLowerCase().includes(query)
        );
        setFilteredReports(filtered);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin');
    };

    const exportToCSV = () => {
        const headers = ['Submission Date', 'Business Name', 'Address', 'Email', 'Signature'];
        const csvData = filteredReports.map(report => [
            new Date(report.created_at).toLocaleString(),
            report.business_name,
            report.address,
            report.email,
            report.signature
        ]);

        const csv = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `annual-reports-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                                <p className="text-sm text-gray-600">Annual Report Submissions</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Submissions</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Today</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.today}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Calendar className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">This Week</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.thisWeek}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Filter className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Export */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by business name, email, or address..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <button
                            onClick={exportToCSV}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export to CSV</span>
                        </button>
                    </div>
                </div>

                {/* Reports Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Business Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Address
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Signature
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredReports.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            {searchQuery ? 'No reports found matching your search.' : 'No submissions yet.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReports.map((report) => (
                                        <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                                    {formatDate(report.created_at)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-sm">
                                                    <Building2 className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                                    <span className="font-medium text-gray-900">{report.business_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Mail className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                                    {report.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-start text-sm text-gray-600 max-w-xs">
                                                    <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                                                    <span className="line-clamp-2">{report.address}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <FileSignature className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                                    <span className="font-serif italic">{report.signature}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    Showing {filteredReports.length} of {reports.length} submissions
                </div>
            </div>
        </div>
    );
}