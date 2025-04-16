<?php

namespace App\Http\Controllers;

use App\Models\Folder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FolderController extends Controller
{
    public function index()
    {
        $folders = auth()->user()->folders()
            ->with(['children', 'files'])
            ->whereNull('parent_id')
            ->get();
            
        return response()->json([
            'success' => true,
            'folders' => $folders
        ]);
    }

    public function show(Folder $folder)
    {
        // Check if user owns the folder
        if (auth()->id() !== $folder->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $folder->load(['children', 'files']);
        
        return response()->json([
            'success' => true,
            'folder' => $folder
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:folders,id'
        ]);

        // If parent_id is provided, check if user owns the parent folder
        if ($request->parent_id) {
            $parentFolder = Folder::find($request->parent_id);
            if (!$parentFolder || $parentFolder->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }
        }

        $folder = Folder::create([
            'name' => $request->name,
            'user_id' => auth()->id(),
            'parent_id' => $request->parent_id
        ]);

        return response()->json([
            'success' => true,
            'folder' => $folder,
            'message' => 'Folder created successfully'
        ]);
    }

    public function update(Request $request, Folder $folder)
    {
        // Check if user owns the folder
        if (auth()->id() !== $folder->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:folders,id'
        ]);

        // If parent_id is provided, check if it's not the same folder or a descendant
        if ($request->parent_id) {
            if ($request->parent_id == $folder->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'A folder cannot be its own parent'
                ], 422);
            }

            // Check if the new parent is not a descendant of this folder
            $parentFolder = Folder::find($request->parent_id);
            $currentParent = $parentFolder;
            while ($currentParent) {
                if ($currentParent->id === $folder->id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cannot move a folder to its own descendant'
                    ], 422);
                }
                $currentParent = $currentParent->parent;
            }
        }

        $folder->update([
            'name' => $request->name,
            'parent_id' => $request->parent_id
        ]);

        return response()->json([
            'success' => true,
            'folder' => $folder->fresh(),
            'message' => 'Folder updated successfully'
        ]);
    }

    public function destroy(Folder $folder)
    {
        // Check if user owns the folder
        if (auth()->id() !== $folder->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Delete all files and subfolders (this will cascade due to relationships)
        $folder->delete();

        return response()->json([
            'success' => true,
            'message' => 'Folder deleted successfully'
        ]);
    }
}
