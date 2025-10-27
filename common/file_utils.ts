import { readFile } from 'fs/promises';
import { join } from 'path';

// Get the plugin's root directory

/**
 * Reads a file from disk and returns its contents as a string
 * @param filePath - Relative path to the file from the plugin's root
 * @returns Promise that resolves with the file contents as a string
 * @throws Error if the file cannot be read or doesn't exist
 */
export async function readFileContent(filePath: string): Promise<string> {
  try {
    // Resolve the path relative to the plugin's root directory
    const absolutePath = join(process.cwd(), filePath);
    console.log(`Attempting to read file from: ${absolutePath}`);

    return await readFile(absolutePath, 'utf-8');
  } catch (error) {
    const errorMessage = `Failed to read file at ${filePath}: ${error instanceof Error ? error.message : String(error)}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}
