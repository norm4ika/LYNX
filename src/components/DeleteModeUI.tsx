'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface DeleteModeUIProps {
    selectedCount: number
    totalCount: number
    isAllSelected: boolean
    onSelectAll: () => void
    onDeleteSelected: () => void
    onCancel: () => void
    isDeleting?: boolean
}

export function DeleteModeUI({
    selectedCount,
    totalCount,
    isAllSelected,
    onSelectAll,
    onDeleteSelected,
    onCancel,
    isDeleting = false
}: DeleteModeUIProps) {
    const someSelected = selectedCount > 0 && selectedCount < totalCount

    return (
        <motion.div
            className="bg-gradient-to-r from-red-600 to-red-700 shadow-2xl border border-red-500/30 rounded-2xl mb-6"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="p-6">
                <div className="flex items-center justify-between">
                    {/* Left side - Selection info */}
                    <div className="flex items-center space-x-6">
                        <motion.div
                            className="flex items-center space-x-3"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                        >
                            <motion.div
                                className="w-6 h-6 bg-white rounded-full flex items-center justify-center"
                                animate={{
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <span className="text-red-600 text-sm font-bold">⚠️</span>
                            </motion.div>
                            <span className="text-white font-medium text-lg">Delete Mode Active</span>
                        </motion.div>

                        <motion.div
                            className="text-white/90"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                        >
                            <span className="font-medium">{selectedCount}</span> of{' '}
                            <span className="font-medium">{totalCount}</span> generations selected
                        </motion.div>
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Select All Checkbox */}
                        <motion.div
                            className="flex items-center space-x-2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.3 }}
                        >
                            <input
                                type="checkbox"
                                id="select-all"
                                checked={isAllSelected}
                                ref={(input) => {
                                    if (input) input.indeterminate = someSelected
                                }}
                                onChange={onSelectAll}
                                className="w-4 h-4 text-red-600 bg-white border-2 border-white rounded focus:ring-red-500 focus:ring-2"
                            />
                            <label htmlFor="select-all" className="text-white text-sm font-medium cursor-pointer">
                                Select All
                            </label>
                        </motion.div>

                        {/* Delete Button */}
                        <motion.button
                            onClick={onDeleteSelected}
                            disabled={selectedCount === 0 || isDeleting}
                            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${selectedCount === 0 || isDeleting
                                    ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                                    : 'bg-white hover:bg-gray-100 text-red-600 hover:shadow-lg'
                                }`}
                            whileHover={selectedCount > 0 && !isDeleting ? { scale: 1.05 } : {}}
                            whileTap={selectedCount > 0 && !isDeleting ? { scale: 0.95 } : {}}
                        >
                            {isDeleting ? (
                                <>
                                    <motion.div
                                        className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                    <span>Deleting...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span>Delete Selected ({selectedCount})</span>
                                </>
                            )}
                        </motion.button>

                        {/* Cancel Button */}
                        <motion.button
                            onClick={onCancel}
                            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Cancel
                        </motion.button>
                    </div>
                </div>

                {/* Progress Bar */}
                {selectedCount > 0 && (
                    <motion.div
                        className="mt-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.3 }}
                    >
                        <div className="w-full bg-white/20 rounded-full h-2">
                            <motion.div
                                className="bg-white h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${(selectedCount / totalCount) * 100}%` }}
                                transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
                            />
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}
