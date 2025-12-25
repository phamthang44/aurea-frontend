import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * API Proxy Route Handler
 * Proxies requests to the backend API and automatically attaches JWT from cookies
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, "PUT");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, "PATCH");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, "DELETE");
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    const path = params.path.join("/");
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();

    // Get access token from HttpOnly cookie
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    // Build backend URL
    const backendUrl = `${API_BASE_URL}/api/v1/${path}${
      searchParams ? `?${searchParams}` : ""
    }`;

    // Prepare headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Attach Authorization header if token exists
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    // Get request body if present
    let body: string | undefined;
    if (method !== "GET" && method !== "DELETE") {
      try {
        body = await request.text();
      } catch {
        // No body
      }
    }

    // Make request to backend
    const response = await fetch(backendUrl, {
      method,
      headers,
      body,
    });

    const data = await response.json();

    // Handle token refresh if 401
    if (response.status === 401 && accessToken) {
      const refreshToken = cookieStore.get("refreshToken")?.value;

      if (refreshToken) {
        try {
          const refreshResponse = await fetch(
            `${API_BASE_URL}/api/v1/auth/refresh`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${refreshToken}`,
              },
            }
          );

          const refreshData = await refreshResponse.json();

          if (refreshResponse.ok && refreshData.data?.accessToken) {
            // Update cookies with new tokens
            cookieStore.set("accessToken", refreshData.data.accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
              maxAge: 60 * 60 * 24 * 7,
            });

            if (refreshData.data.refreshToken) {
              cookieStore.set("refreshToken", refreshData.data.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24 * 30,
              });
            }

            // Retry original request with new token
            const retryResponse = await fetch(backendUrl, {
              method,
              headers: {
                ...headers,
                Authorization: `Bearer ${refreshData.data.accessToken}`,
              },
              body,
            });

            const retryData = await retryResponse.json();
            return NextResponse.json(retryData, {
              status: retryResponse.status,
            });
          }
        } catch (refreshError) {
          // Refresh failed, clear cookies
          cookieStore.delete("accessToken");
          cookieStore.delete("refreshToken");
        }
      } else {
        // No refresh token, clear access token
        cookieStore.delete("accessToken");
      }
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: { message: error.message || "Internal server error" } },
      { status: 500 }
    );
  }
}
