<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Folder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DriveController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Drive/Index', [
            'currentFolder' => null,
            'folders' => auth()->user()->folders()
                ->with(['children', 'files'])
                ->whereNull('parent_id')
                ->get(),
            'rootFiles' => auth()->user()->files()
                ->whereNull('folder_id')
                ->get(),
            'breadcrumbs' => []
        ]);
    }
    
    public function folder(Request $request, Folder $folder)
    {
        // Check if user owns the folder
        if (auth()->id() !== $folder->user_id) {
            return redirect()->route('drive.index');
        }

        // Build breadcrumbs
        $breadcrumbs = [];
        $currentFolder = $folder;
        while ($currentFolder) {
            array_unshift($breadcrumbs, [
                'id' => $currentFolder->id,
                'name' => $currentFolder->name
            ]);
            $currentFolder = $currentFolder->parent;
        }
        
        return Inertia::render('Drive/Index', [
            'currentFolder' => $folder->load(['files']),
            'folders' => $folder->children,
            'rootFiles' => $folder->files,
            'breadcrumbs' => $breadcrumbs
        ]);
    }
    
    public function search(Request $request)
    {
        $search = $request->input('query');
        
        $folders = auth()->user()->folders()
            ->where('name', 'like', "%{$search}%")
            ->get();
            
        $files = auth()->user()->files()
            ->where('name', 'like', "%{$search}%")
            ->orWhere('original_name', 'like', "%{$search}%")
            ->get();
            
        return Inertia::render('Drive/Search', [
            'query' => $search,
            'folders' => $folders,
            'files' => $files
        ]);
    }
}
