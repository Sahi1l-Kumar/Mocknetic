import axios from 'axios';
import { LANGUAGE_IDS, STATUS_IDS, Language, StatusId, TestCase, ExecutionResult, TestResult } from '@/constants';

class Judge0Service {
  private baseURL: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseURL = process.env.JUDGE0_API_URL || 'http://localhost:2358';
    this.headers = {
      'Content-Type': 'application/json'
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Wrap code with test execution logic for different languages
  private wrapCodeForExecution(userCode: string, language: Language, testInput: any): string {
    const { nums, target } = testInput;

    if (language === 'javascript') {
      return `
${userCode}

// Test execution
const nums = ${nums};
const target = ${target};
const result = twoSum(nums, target);
console.log(JSON.stringify(result));
`;
    } else if (language === 'python') {
      return `
from typing import List

${userCode}

# Test execution
if __name__ == "__main__":
    nums = ${nums}
    target = ${target}
    solution = Solution()
    result = solution.twoSum(nums, target)
    print(result)
`;
    } else if (language === 'java') {
      // Extract nums array content for Java
      const numsArray = nums.slice(1, -1); // Remove [ and ]
      
      // CRITICAL: Java must have public class Main for Judge0
      return `
import java.util.*;

${userCode}

public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();
        int[] nums = {${numsArray}};
        int target = ${target};
        int[] result = solution.twoSum(nums, target);
        System.out.println(Arrays.toString(result));
    }
}
`;
    } else if (language === 'cpp') {
      const numsArray = nums.slice(1, -1); // Remove [ and ]
      
      return `
#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

${userCode}

int main() {
    Solution solution;
    vector<int> nums = {${numsArray}};
    int target = ${target};
    vector<int> result = solution.twoSum(nums, target);
    
    cout << "[";
    for(int i = 0; i < result.size(); i++) {
        cout << result[i];
        if(i < result.size() - 1) cout << ",";
    }
    cout << "]" << endl;
    
    return 0;
}
`;
    }

    return userCode;
  }

  // Execute code with specific test case
  async executeCodeWithTestCase(code: string, language: Language, testInput: any): Promise<ExecutionResult> {
    try {
      const wrappedCode = this.wrapCodeForExecution(code, language, testInput);
      console.log('Wrapped code for', language, ':', wrappedCode);
      
      return await this.executeCode(wrappedCode, language, '');
    } catch (error) {
      console.error('Error executing code with test case:', error);
      throw error;
    }
  }

  // Submit code for execution
  async submitCode(code: string, language: Language, input: string = ''): Promise<string> {
    try {
      const languageId = LANGUAGE_IDS[language];
      
      if (!languageId) {
        throw new Error(`Unsupported language: ${language}`);
      }

      const submission = {
        source_code: code,
        language_id: languageId,
        stdin: input,
        wait: false
      };

      console.log('Submitting to Judge0:', { 
        languageId, 
        language,
        codeLength: code.length,
        firstLines: code.split('\n').slice(0, 5).join('\n')
      });

      const response = await axios.post(
        `${this.baseURL}/submissions`,
        submission,
        { 
          headers: this.headers,
          timeout: 10000
        }
      );

      console.log('Judge0 submission response:', response.data);
      return response.data.token;
    } catch (error: any) {
      console.error('Error submitting code:', error.response?.data || error.message);
      throw new Error(`Failed to submit code: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get submission result
  async getSubmissionResult(token: string): Promise<ExecutionResult> {
    try {
      const response = await axios.get(
        `${this.baseURL}/submissions/${token}`,
        { 
          headers: this.headers,
          timeout: 10000
        }
      );

      const result = response.data;
      console.log('Judge0 result:', result);
      
      return {
        status: STATUS_IDS[result.status.id as StatusId] || 'Unknown',
        statusId: result.status.id,
        stdout: result.stdout,
        stderr: result.stderr,
        compile_output: result.compile_output,
        time: result.time,
        memory: result.memory,
        exit_code: result.exit_code,
        exit_signal: result.exit_signal,
        message: result.message,
        created_at: result.created_at,
        finished_at: result.finished_at
      };
    } catch (error: any) {
      console.error('Error getting submission result:', error.response?.data || error.message);
      throw new Error(`Failed to get result: ${error.response?.data?.message || error.message}`);
    }
  }

  // Execute code with polling
  async executeCode(code: string, language: Language, input: string = ''): Promise<ExecutionResult> {
    try {
      const token = await this.submitCode(code, language, input);
      
      // Poll for result
      let result: ExecutionResult;
      let attempts = 0;
      const maxAttempts = 30;
      
      do {
        await this.sleep(1000);
        result = await this.getSubmissionResult(token);
        attempts++;
        console.log(`Polling attempt ${attempts}, status: ${result.status}`);
      } while (result.statusId <= 2 && attempts < maxAttempts);

      if (attempts >= maxAttempts) {
        throw new Error('Execution timeout - code took too long to execute');
      }

      return result;
    } catch (error) {
      console.error('Error executing code:', error);
      throw error;
    }
  }
}

export const judge0Service = new Judge0Service();
