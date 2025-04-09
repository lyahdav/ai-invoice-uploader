import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function InvoiceTableSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-left font-medium">Invoice #</th>
                <th className="py-2 px-4 text-left font-medium">Customer</th>
                <th className="py-2 px-4 text-left font-medium">Vendor</th>
                <th className="py-2 px-4 text-left font-medium">
                  Invoice Date
                </th>
                <th className="py-2 px-4 text-left font-medium">Due Date</th>
                <th className="py-2 px-4 text-right font-medium">Amount</th>
                <th className="py-2 px-4 text-left font-medium">
                  Uploaded Date
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: order of rows won't change
                <tr key={index} className="border-b">
                  <td className="py-2 px-4">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="py-2 px-4">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="py-2 px-4">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="py-2 px-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="py-2 px-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="py-2 px-4">
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </td>
                  <td className="py-2 px-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
