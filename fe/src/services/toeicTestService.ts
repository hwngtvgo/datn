import axios from "axios";
import { API_URL } from "../config/constants";
import { ToeicQuestionDTO } from "./toeicQuestionService";

// Định nghĩa kiểu dữ liệu
export enum TestStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED"
}

export enum TestType {
  FULL_TEST = "FULL_TEST",
  MINI_TEST = "MINI_TEST",
  PRACTICE = "PRACTICE"
}

export interface ToeicTestDTO {
  id?: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  durationMinutes: number;
  status: TestStatus;
  testType?: TestType;
  questions?: ToeicQuestionDTO[];
  createdById?: number;
  createdByUsername?: string;
}

// API calls
const getAllTests = async (page = 0, size = 20) => {
  const response = await axios.get(`${API_URL}/tests?page=${page}&size=${size}`, {
    withCredentials: true
  });
  return response.data.content || [];
};

const getPublicTests = async (page = 0, size = 20) => {
  const response = await axios.get(`${API_URL}/tests/public?page=${page}&size=${size}`, {
    withCredentials: true
  });
  return response.data.content || [];
};

const getTestById = async (id: number) => {
  const response = await axios.get(`${API_URL}/tests/${id}`, {
    withCredentials: true
  });
  return response.data;
};

const getTestWithAnswers = async (id: number) => {
  const response = await axios.get(`${API_URL}/tests/${id}/with-answers`, {
    withCredentials: true
  });
  return response.data;
};

const createTest = async (testData: ToeicTestDTO) => {
  const response = await axios.post(`${API_URL}/tests`, testData, {
    withCredentials: true
  });
  return response.data;
};

const updateTest = async (id: number, testData: ToeicTestDTO) => {
  const response = await axios.put(`${API_URL}/tests/${id}`, testData, {
    withCredentials: true
  });
  return response.data;
};

const updateTestStatus = async (id: number, status: TestStatus) => {
  const response = await axios.patch(`${API_URL}/tests/${id}/status`, { status }, {
    withCredentials: true
  });
  return response.data;
};

const deleteTest = async (id: number) => {
  await axios.delete(`${API_URL}/tests/${id}`, {
    withCredentials: true
  });
  return true;
};

const duplicateTest = async (id: number) => {
  const response = await axios.post(`${API_URL}/tests/${id}/duplicate`, {}, {
    withCredentials: true
  });
  return response.data;
};

const getTotalTestCount = async () => {
  const response = await axios.get(`${API_URL}/tests/count`, {
    withCredentials: true
  });
  return response.data;
};

const getRecentTests = async (limit = 5) => {
  const response = await axios.get(`${API_URL}/tests/recent?limit=${limit}`, {
    withCredentials: true
  });
  return response.data;
};

export default {
  getAllTests,
  getPublicTests,
  getTestById,
  getTestWithAnswers,
  createTest,
  updateTest,
  updateTestStatus,
  deleteTest,
  duplicateTest,
  getTotalTestCount,
  getRecentTests
};