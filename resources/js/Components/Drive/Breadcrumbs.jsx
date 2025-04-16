import { Link } from '@inertiajs/react';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

export default function Breadcrumbs({ currentFolder, breadcrumbs }) {
    return (
        <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                    <Link
                        href={route('drive.index')}
                        className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                    >
                        <HomeIcon className="w-4 h-4 mr-2" />
                        My Drive
                    </Link>
                </li>
                
                {breadcrumbs.map((breadcrumb, index) => (
                    <li key={breadcrumb.id}>
                        <div className="flex items-center">
                            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                            <Link
                                href={route('drive.folder', { folder: breadcrumb.id })}
                                className={`ml-1 text-sm font-medium ${
                                    index === breadcrumbs.length - 1
                                        ? 'text-blue-600 hover:text-blue-700'
                                        : 'text-gray-700 hover:text-blue-600'
                                }`}
                            >
                                {breadcrumb.name}
                            </Link>
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    );
} 