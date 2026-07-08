import React from 'react';

export function ResponsiveListView<T>({
  items,
  renderItemMobile,
  renderHeaderDesktop,
  renderRowDesktop,
  keyExtractor,
}: {
  items: T[];
  renderItemMobile: (item: T) => React.ReactNode;
  renderHeaderDesktop: () => React.ReactNode;
  renderRowDesktop: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}) {
  return (
    <>
      <div className="space-y-3 p-3 md:hidden">
        {items.map(item => (
          <React.Fragment key={keyExtractor(item)}>
            {renderItemMobile(item)}
          </React.Fragment>
        ))}
        {items.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">No items found.</div>
        )}
      </div>
      <div className="hidden overflow-auto md:block">
        <table className="w-full text-sm">
          <thead>{renderHeaderDesktop()}</thead>
          <tbody>
            {items.map(item => (
              <React.Fragment key={keyExtractor(item)}>
                {renderRowDesktop(item)}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
