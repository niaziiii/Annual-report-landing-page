"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, AnnualReport } from "@/lib/supabase";
import {
    FileText,
    LogOut,
    Download,
    Search,
    Calendar,
    Building2,
    Mail,
    FileSignature,
    Loader2,
    ShieldCheck,
} from "lucide-react";

export default function AdminDashboard() {
    const [reports, setReports] = useState<AnnualReport[]>([]);
    const [filteredReports, setFilteredReports] = useState<AnnualReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
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
        const {
            data: { session },
        } = await supabase.auth.getSession();
        if (!session) router.push("/admin");
    };

    const fetchReports = async () => {
        try {
            const { data, error } = await supabase
                .from("annual_reports")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;

            setReports(data || []);
            calculateStats(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data: AnnualReport[]) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);

        setStats({
            total: data.length,
            today: data.filter(r => new Date(r.created_at) >= today).length,
            thisWeek: data.filter(r => new Date(r.created_at) >= weekAgo).length,
        });
    };

    const filterReports = () => {
        if (!searchQuery.trim()) return setFilteredReports(reports);

        const q = searchQuery.toLowerCase();
        setFilteredReports(
            reports.filter(r =>
                r.business_name.toLowerCase().includes(q) ||
                r.email.toLowerCase().includes(q) ||
                r.address.toLowerCase().includes(q) ||
                r.signature.toLowerCase().includes(q)
            )
        );
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/admin");
    };

    const exportToCSV = () => {
        const headers = ["Date", "Business", "Email", "Address", "Signature"];
        const rows = filteredReports.map(r => [
            new Date(r.created_at).toLocaleString(),
            r.business_name,
            r.email,
            r.address,
            r.signature,
        ]);

        const csv = [
            headers.join(","),
            ...rows.map(r => r.map(v => `"${v}"`).join(",")),
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `annual-reports-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-900 text-white rounded-md flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">
                                Admin Dashboard
                            </h1>
                            <p className="text-xs text-gray-500">
                                Annual Report Submissions
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800 transition"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Stat label="Total Submissions" value={stats.total} />
                    <Stat label="Today" value={stats.today} />
                    <Stat label="Last 7 Days" value={stats.thisWeek} />
                </div>

                {/* Controls */}
                <div className="bg-white border border-gray-200 rounded-md p-4 mb-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search submissions..."
                            className="input pl-9 pr-3 py-2"

                        />
                    </div>

                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-md overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                                    Date
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                                    Business
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                                    Email
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                                    Payment
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                                    Signature
                                </th>
                            </tr>
                        </thead>


                        <tbody className="divide-y divide-gray-200">
                            {filteredReports.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-gray-500">
                                        No submissions found
                                    </td>
                                </tr>
                            ) : (
                                filteredReports.map(r => (
                                    <tr key={r.id} className="hover:bg-gray-50 transition">
                                        {/* Date */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-gray-900">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {new Date(r.created_at).toLocaleString()}
                                            </div>
                                        </td>

                                        {/* Business */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                                                <span className="font-medium text-gray-900">
                                                    {r.business_name}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                                                <span className="truncate max-w-[220px]">{r.email}</span>
                                            </div>
                                        </td>

                                        {/* Payment */}
                                        <td className="px-4 py-3">
                                            <div className="text-sm text-gray-900 font-medium">
                                                ${r.amount || "210.00"}
                                            </div>
                                            <div className="text-xs text-gray-500 capitalize">
                                                {r.payment_processor}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3">
                                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                {r.payment_status || "completed"}
                                            </span>
                                        </td>

                                        {/* Signature */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 text-sm font-serif italic text-gray-900">
                                                <FileSignature className="w-4 h-4 text-gray-400 shrink-0" />
                                                <span className="truncate max-w-[200px]">
                                                    {r.signature}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>

                    </table>
                </div>

                <p className="mt-4 text-xs text-gray-500 text-center">
                    Showing {filteredReports.length} of {reports.length} submissions
                </p>
            </main>

            {/* Shared input styles */}
            <style jsx>{`
  .input {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    outline: none;
  }
  .input:focus {
    border-color: #111827;
    box-shadow: 0 0 0 1px #111827;
  }
`}</style>

        </div>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="bg-white border border-gray-200 rounded-md p-4">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
    );
}
