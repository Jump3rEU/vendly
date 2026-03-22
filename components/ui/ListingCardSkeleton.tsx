export default function ListingCardSkeleton() {
  return (
    <div className="group block bg-white rounded-[2rem] border-0 overflow-hidden shadow-lg animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300" />
      
      {/* Content skeleton */}
      <div className="p-5 space-y-3">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
          <div className="h-4 bg-gray-200 rounded-lg w-1/2" />
        </div>
        
        {/* Price */}
        <div className="h-8 bg-gray-200 rounded-lg w-2/5" />
        
        {/* Location */}
        <div className="h-4 bg-gray-200 rounded-lg w-1/3" />
      </div>
    </div>
  )
}
