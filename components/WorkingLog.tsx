'use client';

interface WorkingLogProps {
  totalDays?: number;
  activeDays?: number[];  // Array of day indices (0-99) that are active
  startDate?: Date;
}

export default function WorkingLog({
  totalDays = 100,
  activeDays = [],
  startDate = new Date()
}: WorkingLogProps) {
  const rows = 7; // Days of the week
  const cols = Math.ceil(totalDays / rows); // ~15 columns for 100 days

  // Calculate contributions in the last week
  const today = new Date();
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // For now, count active days as contributions
  // In a real implementation, this would filter by date
  const weeklyContributions = activeDays.length;

  // Create grid data - organized by columns first (like GitHub)
  const getSquareIndex = (row: number, col: number): number => {
    return col * rows + row;
  };

  const isActive = (index: number): boolean => {
    return activeDays.includes(index);
  };

  return (
    <div className="mt-16">
      <h2 className="text-working-log-title mb-2">Working Log</h2>
      <p className="text-working-log-subtitle mb-6">
        {weeklyContributions} contributions in the last week
      </p>

      <div className="flex gap-1.5">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <div key={colIndex} className="flex flex-col gap-1.5">
            {Array.from({ length: rows }).map((_, rowIndex) => {
              const squareIndex = getSquareIndex(rowIndex, colIndex);
              if (squareIndex >= totalDays) return null;

              const active = isActive(squareIndex);

              return (
                <div
                  key={rowIndex}
                  className={`w-8 h-8 rounded-lg ${
                    active
                      ? 'bg-yellow-200 border border-yellow-300'
                      : 'bg-gray-100 border border-gray-200'
                  }`}
                  title={`Day ${squareIndex + 1}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
