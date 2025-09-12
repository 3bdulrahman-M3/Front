import React from "react";
import AdminChatInterface from "../components/AdminChatInterface";
import ApiTester from "../components/ApiTester";
import ConnectionTester from "../components/ConnectionTester";

const AdminChat = () => {
  return (
    <>
      {/* Hero */}
      <section
        className="relative min-h-[20vh] flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-6"
        style={{ paddingTop: "80px", paddingBottom: "20px" }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Chat Management
          </span>
        </h1>
        <p className="max-w-2xl text-gray-600">
          Manage user conversations and provide support through our chat system.
        </p>
      </section>

      {/* Connection & API Testers */}
      <section className="px-6 bg-white py-4">
        <div className="max-w-full mx-auto space-y-4">
          <ConnectionTester />
          <ApiTester />
        </div>
      </section>

      {/* Chat Interface */}
      <section className="px-6 bg-gray-100" style={{ minHeight: "calc(100vh - 300px)" }}>
        <div className="max-w-full mx-auto">
          <AdminChatInterface />
        </div>
      </section>
    </>
  );
};

export default AdminChat;
