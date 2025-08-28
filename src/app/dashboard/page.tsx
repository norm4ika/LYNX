'use client'

import { useAuth } from '@/contexts/AuthContext'
import useSWR from 'swr'
import Navigation from '@/components/Navigation'
import { formatDate } from '@/lib/utils'
import { useState } from 'react'

const fetcher = async (url: string, token: string) => {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json()
}

export default function DashboardPage() {
  const { user, session } = useAuth()
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const { data: generations = [], error, mutate } = useSWR(
    user && session?.access_token ? ['/api/generations', session.access_token] : null,
    ([url, token]) => fetcher(url, token),
    { refreshInterval: 5000 } // Refresh every 5 seconds
  )

  // Calculate statistics
  const totalGenerations = generations.length
  const completedGenerations = generations.filter((g: any) => g.status === 'completed').length
  const pendingGenerations = generations.filter((g: any) => g.status === 'pending').length
  const failedGenerations = generations.filter((g: any) => g.status === 'failed').length
  const processingGenerations = generations.filter((g: any) => g.status === 'processing').length

  // Calculate average quality score
  const completedWithScore = generations.filter((g: any) => g.status === 'completed' && g.quality_score)
  const averageQualityScore = completedWithScore.length > 0
    ? (completedWithScore.reduce((sum: number, g: any) => sum + g.quality_score, 0) / completedWithScore.length).toFixed(1)
    : 'N/A'

  // Filter generations by status
  const filteredGenerations = selectedStatus === 'all'
    ? generations
    : generations.filter((g: any) => g.status === selectedStatus)

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">გთხოვთ შეხვიდეთ სისტემაში</h1>
            <p>დეშბორდის სანახავად აუცილებელია ავტორიზაცია</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Ultra-Realistic Commercial AI დეშბორდი</h1>
          <p className="text-white/60">მოგესალმებათ, {user.email}</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <div className="text-2xl font-bold text-white">{totalGenerations}</div>
            <div className="text-white/60">სულ გენერაცია</div>
          </div>
          <div className="bg-green-500/20 backdrop-blur-md rounded-lg p-6 border border-green-500/30">
            <div className="text-2xl font-bold text-green-400">{completedGenerations}</div>
            <div className="text-white/60">დასრულებული</div>
          </div>
          <div className="bg-blue-500/20 backdrop-blur-md rounded-lg p-6 border border-blue-500/30">
            <div className="text-2xl font-bold text-blue-400">{processingGenerations}</div>
            <div className="text-white/60">დამუშავება</div>
          </div>
          <div className="bg-yellow-500/20 backdrop-blur-md rounded-lg p-6 border border-yellow-500/30">
            <div className="text-2xl font-bold text-yellow-400">{pendingGenerations}</div>
            <div className="text-white/60">მიმდინარე</div>
          </div>
          <div className="bg-red-500/20 backdrop-blur-md rounded-lg p-6 border border-red-500/30">
            <div className="text-2xl font-bold text-red-400">{failedGenerations}</div>
            <div className="text-white/60">შეცდომა</div>
          </div>
        </div>

        {/* Quality Score Card */}
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md rounded-lg p-6 border border-purple-500/30 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">საშუალო ხარისხის ქულა</h3>
              <p className="text-white/60">Ultra-Realistic Commercial AI</p>
            </div>
            <div className="text-3xl font-bold text-purple-400">{averageQualityScore}</div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 text-white"
          >
            <option value="all">ყველა სტატუსი</option>
            <option value="pending">მიმდინარე</option>
            <option value="processing">დამუშავება</option>
            <option value="completed">დასრულებული</option>
            <option value="failed">შეცდომა</option>
          </select>
        </div>

        {/* Generations List */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden">
          {error ? (
            <div className="p-6 text-center text-red-400">
              შეცდომა მონაცემების ჩატვირთვისას
            </div>
          ) : filteredGenerations.length === 0 ? (
            <div className="p-6 text-center text-white/60">
              {selectedStatus === 'all' ? 'გენერაციები არ არის' : 'ამ სტატუსის გენერაციები არ არის'}
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredGenerations.map((generation: any) => (
                <div key={generation.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${generation.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            generation.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              generation.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-red-500/20 text-red-400'
                          }`}>
                          {generation.status === 'completed' ? 'დასრულებული' :
                            generation.status === 'pending' ? 'მიმდინარე' :
                              generation.status === 'processing' ? 'დამუშავება' :
                                'შეცდომა'}
                        </span>
                        <span className="text-white/40 text-sm">
                          {formatDate(generation.created_at)}
                        </span>
                        {generation.quality_score && (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                            ხარისხი: {generation.quality_score}/10
                          </span>
                        )}
                        {generation.processing_time && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                            {Math.round(generation.processing_time / 1000)}s
                          </span>
                        )}
                      </div>

                      <p className="text-white mb-3">{generation.prompt_text}</p>

                      {/* Commercial Style & Target Audience */}
                      {(generation.commercial_style || generation.target_audience) && (
                        <div className="flex space-x-4 mb-3">
                          {generation.commercial_style && (
                            <span className="px-2 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 rounded text-xs">
                              {generation.commercial_style}
                            </span>
                          )}
                          {generation.target_audience && (
                            <span className="px-2 py-1 bg-gradient-to-r from-green-500/20 to-teal-500/20 text-green-300 rounded text-xs">
                              {generation.target_audience}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex space-x-4">
                        {generation.original_image_url && (
                          <div>
                            <p className="text-white/60 text-sm mb-1">ორიგინალი სურათი:</p>
                            <img
                              src={generation.original_image_url}
                              alt="Original"
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          </div>
                        )}

                        {generation.generated_image_url && (
                          <div>
                            <p className="text-white/60 text-sm mb-1">Ultra-Realistic რეკლამა:</p>
                            <img
                              src={generation.generated_image_url}
                              alt="Generated"
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>

                      {/* N8N Execution Info */}
                      {generation.n8n_execution_id && (
                        <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-300">
                          N8N Execution ID: {generation.n8n_execution_id}
                        </div>
                      )}

                      {generation.error_message && (
                        <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                          <p className="text-red-400 text-sm">{generation.error_message}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
