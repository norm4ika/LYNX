import { NextRequest, NextResponse } from 'next/server'
import { validateImageFile, validateImageContent, getFileExtension } from '@/lib/utils'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({
                error: 'No file provided',
                valid: false
            }, { status: 400 })
        }

        console.log('File validation request:', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
        })

        const validationResults = {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            fileExtension: getFileExtension(file.name),
            valid: true,
            errors: [] as string[],
            warnings: [] as string[]
        }

        try {
            // Basic validation
            validateImageFile(file)
        } catch (validationError: any) {
            validationResults.valid = false
            validationResults.errors.push(validationError.message)
        }

        // Content validation (only if basic validation passed)
        if (validationResults.valid) {
            try {
                const isValidContent = await validateImageContent(file)
                if (!isValidContent) {
                    validationResults.valid = false
                    validationResults.errors.push('File content validation failed - not a valid image')
                }
            } catch (contentError: any) {
                validationResults.valid = false
                validationResults.errors.push(`Content validation error: ${contentError.message}`)
            }
        }

        // Additional checks
        if (file.size === 0) {
            validationResults.valid = false
            validationResults.errors.push('File is empty')
        }

        if (file.size > 15 * 1024 * 1024) {
            validationResults.valid = false
            validationResults.errors.push('File size exceeds 15MB limit')
        }

        // Check for common issues
        if (file.name.includes(' ')) {
            validationResults.warnings.push('File name contains spaces - consider renaming')
        }

        if (file.name.length > 100) {
            validationResults.warnings.push('File name is very long - consider shortening')
        }

        return NextResponse.json({
            ...validationResults,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('File validation error:', error)
        return NextResponse.json({
            error: 'File validation failed',
            details: error instanceof Error ? error.message : 'Unknown error',
            valid: false
        }, { status: 500 })
    }
}
