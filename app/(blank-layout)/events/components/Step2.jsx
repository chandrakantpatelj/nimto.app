'use client';

import React from 'react';
import { Building, Calendar, Clock, MapPin, Star, Users } from 'lucide-react';

function Step2() {
  // Mock event data - in real app this would come from props or API
  const eventData = {
    title: 'gfdgggdfg gdfg',
    date: 'Thursday, August 21, 2025',
    time: '00:25',
    location: 'Surat, Gujarat, India',
    description: 'test cdasfsf ds fsdf',
    bannerImage: '/media/images/sunrise-mountains.jpg', // Placeholder image path
    attendees: '150+',
    rating: '4.8',
  };

  return (
    <div className="flex flex-1 overflow-hidden bg-gray-50">
      <main className="flex-1 overflow-auto p-8">
        {/* Subtle Event Banner */}
        <div className="relative">
          {/* Main Banner Card */}
          <div className="bg-background rounded-xl overflow-hidden shadow-sm border border-gray-100">
            {/* Event Banner Content */}
            <div className="relative h-72 bg-gradient-to-br from-slate-50 to-gray-100">
              {/* Subtle Background Elements */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl transform translate-x-12 -translate-y-12"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-purple-500/5 rounded-full blur-lg transform -translate-x-10 translate-y-10"></div>

              {/* Banner Image with Subtle Styling */}
              <div className="absolute top-6 left-6 w-36 h-24 bg-background rounded-lg shadow-sm overflow-hidden">
                <img
                  src={eventData.bannerImage}
                  alt="Event Banner"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-full bg-gradient-to-br from-primary-100 to-purple-100 items-center justify-center">
                  <div className="text-center">
                    <Star className="w-5 h-5 text-primary mx-auto mb-1" />
                    <span className="text-xs text-gray-600 font-medium">
                      Event Banner
                    </span>
                  </div>
                </div>
              </div>

              {/* Event Title with Clean Typography */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-background/90 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-gray-100">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Major Tech Conference
                  </h1>
                  <div className="flex items-center space-x-6 mt-2">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{eventData.attendees} attending</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{eventData.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <aside className="w-124 flex-shrink-0 bg-background p-6 border-l border-gray-200 overflow-y-auto min-h-[calc(100vh-var(--header-height))] h-100">
        <div className="space-y-6">
          {/* Subtle Conference Label */}
          <div>
            <span className="inline-block px-2 py-1 text-xs font-medium text-primary bg-primary/5 rounded-md uppercase tracking-wide">
              Conference
            </span>
          </div>

          {/* Conference Title */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">
              {eventData.title}
            </h2>
            <div className="w-12 h-0.5 bg-primary rounded-full"></div>
          </div>

          {/* Date and Time */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-primary/10 rounded-md">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Date and Time
                </p>
                <p className="text-sm text-gray-600 font-medium">
                  {eventData.date}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <Clock className="w-3 h-3 text-primary" />
                  <p className="text-sm text-gray-600">{eventData.time}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-500/10 rounded-md">
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Location</p>
                <p className="text-sm text-gray-600 font-medium">
                  {eventData.location}
                </p>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
              About this event
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {eventData.description}
            </p>
          </div>

          {/* Location Map */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-500/10 rounded-md">
                <Building className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Location
              </span>
            </div>

            {/* Map Container */}
            <div className="bg-gray-50 rounded-lg p-4 min-h-[180px] flex items-center justify-center border border-gray-100">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-700 font-medium">
                    Google Maps Platform rejected your request.
                  </p>
                  <p className="text-xs text-gray-500 max-w-xs">
                    This API key is not authorized to use this service or API.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Google Maps Link */}
          <div className="pt-4 border-t border-gray-200">
            <a
              href="#"
              className="inline-flex items-center space-x-2 text-sm font-medium text-primary hover:text-primary-700 transition-colors"
            >
              <span>View on Google Maps</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Step2;
