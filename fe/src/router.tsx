import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import PracticeTests from "./pages/PracticeTests";
import TestPage from "./pages/PracticeTests/TestPage";
import Learning from "./pages/Learning";
import LevelPage from "./pages/Learning/LevelPage";
import VocabularyPage from "./pages/Learning/VocabularyPage";
import GrammarPage from "./pages/Learning/GrammarPage";
import ListeningPage from "./pages/Learning/ListeningPage";
import FillInBlanksPage from "./pages/Learning/FillInBlanksPage";
import VocabularyStoriesPage from "./pages/Learning/VocabularyStoriesPage";
import VocabularyStoryDetail from "./pages/Learning/VocabularyStoryDetail";
import TestHistory from "./pages/User/TestHistory";
import TestStatistics from "./pages/User/TestStatistics";
import TestResultDetail from "./pages/User/TestResultDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: "practice-tests", element: <PracticeTests /> },
      { path: "practice-tests/:id", element: <TestPage /> },
      { path: "learning", element: <Learning /> },
      { path: "learning/:level", element: <LevelPage /> },
      { path: "learning/:level/vocabulary", element: <VocabularyPage /> },
      { path: "learning/:level/grammar", element: <GrammarPage /> },
      { path: "learning/:level/listening", element: <ListeningPage /> },
      { path: "learning/:level/fill-in-blanks", element: <FillInBlanksPage /> },
      { path: "learning/:level/vocabulary-stories", element: <VocabularyStoriesPage /> },
      { path: "learning/:level/vocabulary-stories/:id", element: <VocabularyStoryDetail /> },
      { path: "test-history", element: <TestHistory /> },
      { path: "test-statistics", element: <TestStatistics /> },
      { path: "test-results/:id", element: <TestResultDetail /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "account", element: <Account /> },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}