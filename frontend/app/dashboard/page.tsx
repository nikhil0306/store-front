import { getServerSession } from "next-auth"

export default async function DashboardPage() {
    const session = await getServerSession()

    return (
        <div>
            <h1 className="text-xl font-medium mb-1">
                Welcome, {session?.user?.name}
            </h1>
            <p className="text-sm text-gray-500">
                Your StoreFront dashboard
            </p>

            <div className="grid grid-cols-4 gap-3 mt-6">
                {[
                    { label: "Revenue", value: "₹0" },
                    { label: "Orders", value: "0" },
                    { label: "Products", value: "0" },
                    { label: "Store visits", value: "0" },
                ].map((card) => (
                    <div
                        key={card.label}
                        className="bg-white border border-gray-200 rounded-lg p-4"
                    >
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                            {card.label}
                        </p>
                        <p className="text-2xl font-medium">{card.value}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}