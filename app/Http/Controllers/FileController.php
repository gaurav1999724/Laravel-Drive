<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Folder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class FileController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:102400', // 100MB max
            'folder_id' => 'nullable|exists:folders,id'
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $mimeType = $file->getMimeType();
        $size = $file->getSize();
        $name = pathinfo($originalName, PATHINFO_FILENAME);
        $uniqueName = Str::uuid() . '.' . $extension;

        // Upload to S3
        $path = $file->storeAs('files', $uniqueName, 's3');

        // Create file record
        $fileRecord = File::create([
            'name' => $name,
            'original_name' => $originalName,
            'path' => $path,
            'mime_type' => $mimeType,
            'extension' => $extension,
            'size' => $size,
            'user_id' => auth()->id(),
            'folder_id' => $request->folder_id
        ]);

        return response()->json([
            'success' => true,
            'file' => $fileRecord->load('folder'),
            'message' => 'File uploaded successfully'
        ]);
    }

    public function delete(File $file)
    {
        if (auth()->id() !== $file->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        try{
            Storage::disk('s3')->delete($file->path);
        }catch(\Exception $e){
            \Log::error('Failed to delete file from S3: ' . $e->getMessage());
        }

        $file->delete();

        return response()->json([
            'success' => true,
            'message' => 'File deleted successfully'
        ]);
    }

    public function update(Request $request, File $file)
    {
        // Check if user owns the file
        if (auth()->id() !== $file->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'folder_id' => 'nullable|exists:folders,id'
        ]);

        $file->update([
            'name' => $request->name,
            'folder_id' => $request->folder_id
        ]);

        return response()->json([
            'success' => true,
            'file' => $file->fresh(),
            'message' => 'File updated successfully'
        ]);
    }

    public function getUrl(File $file)
    {
        // Check if user owns the file
        if (auth()->id() !== $file->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'url' => $file->cdn_url,
            'message' => 'URL generated successfully'
        ]);
    }

    public function download(File $file)
    {
        // Check if user owns the file
        if (auth()->id() !== $file->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Generate temporary URL for download
        $url = Storage::disk('s3')->temporaryUrl(
            $file->path,
            now()->addMinutes(5),
            [
                'ResponseContentDisposition' => 'attachment; filename="' . $file->original_name . '"'
            ]
        );

        return response()->json([
            'success' => true,
            'url' => $url,
            'message' => 'Download URL generated successfully'
        ]);
    }
}
