export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-medium text-gray-900 mb-2">
                    Store not found
                </h1>
                <p className="text-sm text-gray-500">
                    This store doesn't exist or is currently inactive.
                </p>
            </div>
        </div>
    )
}