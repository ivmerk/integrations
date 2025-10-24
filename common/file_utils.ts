import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Reads a file from disk and returns its contents as a string
 * @param filePath - Absolute or relative path to the file
 * @returns Promise that resolves with the file contents as a string
 * @throws Error if the file cannot be read or doesn't exist
 */
export async function readFileContent(filePath: string): Promise<string> {
  try {
    // If the path is relative, resolve it relative to the current working directory
    const absolutePath = filePath.startsWith('/') 
      ? filePath 
      : join(process.cwd(), filePath);
    
    const fileContent = await readFile(absolutePath, 'utf-8');
    return fileContent;
  } catch (error) {
    throw new Error(`Failed to read file at ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Example usage:
// const content = await readFileContent('./path/to/your/file.txt');
// console.log(content);
