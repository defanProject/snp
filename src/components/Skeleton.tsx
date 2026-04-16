import React from 'react';
import { motion } from 'motion/react';

export const Skeleton = ({ className }: { className?: string }) => (
  <motion.div
    initial={{ opacity: 0.5 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
    className={`bg-gray-200 rounded-xl ${className}`}
  />
);

export const ResultSkeleton = () => (
  <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-w-md mx-auto w-full text-left">
    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-6 w-6 rounded-full" />
    </div>
    <div className="p-4 space-y-4">
      <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
      <div className="flex items-center space-x-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex space-x-4 py-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="flex flex-col space-y-2">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  </div>
);

export const SearchSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
    {[...Array(10)].map((_, i) => (
      <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 flex flex-col">
        <Skeleton className="aspect-[3/4] w-full" />
        <div className="p-3 space-y-3">
          <div className="flex items-center space-x-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
        </div>
      </div>
    ))}
  </div>
);
