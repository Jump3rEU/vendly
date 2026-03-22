import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import AdminAIInsights from '@/components/admin/AdminAIInsights';
import Link from 'next/link';
import { LayoutDashboard, ShieldCheck, FileText, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Vendly',
  description: 'AI-powered insights and analytics for platform administrators',
};

export default async function AdminDashboardPage() {
  const user = await requireAuth([UserRole.ADMIN]);

  // If we got here, user is definitely admin (requireAuth would throw otherwise)
  if (!user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Admin Dashboard
              </h1>
              <p className="text-slate-600 mt-1">
                AI-powered insights a analýzy platformy
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
            <Link
              href="/admin/inzeraty"
              className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-slate-200 hover:border-purple-400 hover:shadow-md transition-all group"
            >
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">Správa inzerátů</div>
                <div className="text-sm text-slate-600">AI analýza a moderace</div>
              </div>
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">Správa uživatelů</div>
                <div className="text-sm text-slate-600">Suspenze a bany</div>
              </div>
            </Link>

            <Link
              href="/admin/disputes"
              className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-slate-200 hover:border-red-400 hover:shadow-md transition-all group"
            >
              <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                <LayoutDashboard className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">Spory</div>
                <div className="text-sm text-slate-600">Řešení a refundace</div>
              </div>
            </Link>

            <Link
              href="/admin/reports"
              className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-slate-200 hover:border-orange-400 hover:shadow-md transition-all group"
            >
              <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <LayoutDashboard className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">Nahlášení</div>
                <div className="text-sm text-slate-600">Řešení reportů</div>
              </div>
            </Link>

            <Link
              href="/admin/logs"
              className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-slate-200 hover:border-green-400 hover:shadow-md transition-all group"
            >
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">Audit Log</div>
                <div className="text-sm text-slate-600">Historie akcí</div>
              </div>
            </Link>
          </div>
        </div>

        {/* AI Insights Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-purple-500 to-blue-600">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6" />
              AI Insights
            </h2>
            <p className="text-purple-100 mt-1">
              Automatická analýza tržních trendů, rizik a chování uživatelů
            </p>
          </div>

          <div className="p-6">
            <AdminAIInsights />
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">O AI analýze:</p>
              <ul className="space-y-1 text-blue-800">
                <li>• Analýza je založena na agregovaných datech z posledních 7-30 dní</li>
                <li>• AI detekuje podezřelé vzorce a tržní trendy</li>
                <li>• Všechny návrhy by měly být ověřeny lidským moderátorem</li>
                <li>• Data jsou anonymizována pro zachování soukromí uživatelů</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
