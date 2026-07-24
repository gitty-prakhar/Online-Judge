import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { TestCase } from "../models/testCase.model.js";
import { Problem } from "../models/problem.model.js";

// 1. Create a Test Case (Admin/Setter only)
const createTestCase = asyncHandler(async (req, res) => {
    const { problemId, input, expectedOutput, isHidden } = req.body;

    if (!problemId || !input || !expectedOutput) {
        throw new ApiError(400, "problemId, input, and expectedOutput are required");
    }

    // Verify problem exists and user has permission
    const problem = await Problem.findById(problemId);
    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }

    if (problem.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        throw new ApiError(403, "You do not have permission to add test cases to this problem");
    }

    const testCase = await TestCase.create({
        problemId,
        input,
        expectedOutput,
        isHidden: isHidden !== undefined ? isHidden : true
    });

    return res.status(201).json(new APIResponse(201, testCase, "Test case created successfully"));
});

// 2. Get Test Cases for a problem (Judge/Admin only for hidden ones, or just sample ones for users)
const getTestCases = asyncHandler(async (req, res) => {
    const { problemId } = req.params;
    const { includeHidden } = req.query;

    const problem = await Problem.findById(problemId);
    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }

    let filter = { problemId };
    
    // Only author or admin can see hidden test cases
    if (includeHidden === 'true') {
        if (!req.user || (problem.author.toString() !== req.user._id.toString() && req.user.role !== "admin")) {
            throw new ApiError(403, "You do not have permission to view hidden test cases");
        }
    } else {
        filter.isHidden = false;
    }

    const testCases = await TestCase.find(filter);

    return res.status(200).json(new APIResponse(200, testCases, "Test cases fetched successfully"));
});

// 3. Update Test Case
const updateTestCase = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { input, expectedOutput, isHidden } = req.body;

    const testCase = await TestCase.findById(id).populate("problemId");
    if (!testCase) {
        throw new ApiError(404, "Test case not found");
    }

    if (testCase.problemId.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        throw new ApiError(403, "You do not have permission to edit this test case");
    }

    const updatedTestCase = await TestCase.findByIdAndUpdate(
        id,
        {
            $set: {
                ...(input && { input }),
                ...(expectedOutput && { expectedOutput }),
                ...(isHidden !== undefined && { isHidden })
            }
        },
        { new: true, runValidators: true }
    );

    return res.status(200).json(new APIResponse(200, updatedTestCase, "Test case updated successfully"));
});

// 4. Delete Test Case
const deleteTestCase = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const testCase = await TestCase.findById(id).populate("problemId");
    if (!testCase) {
        throw new ApiError(404, "Test case not found");
    }

    if (testCase.problemId.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        throw new ApiError(403, "You do not have permission to delete this test case");
    }

    await TestCase.findByIdAndDelete(id);

    return res.status(200).json(new APIResponse(200, {}, "Test case deleted successfully"));
});

export {
    createTestCase,
    getTestCases,
    updateTestCase,
    deleteTestCase
};
