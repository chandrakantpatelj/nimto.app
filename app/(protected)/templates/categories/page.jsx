'use client';

import React, { Fragment, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/container';
import { RouteGuard } from '@/components/common/route-guard';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/components/common/toolbar';
import {
  ToolbarDescription,
  ToolbarPageTitle,
} from '@/app/components/partials/common/toolbar';
import { PageNavbar } from '../../account/page-navbar';
import { CategoryForm } from './components/CategoryForm';
import { CategoryManagement } from './content';

function CategoryManagementPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBackToTemplates = () => {
    router.push('/templates');
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleFormSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    handleFormClose();
  };

  return (
    <RouteGuard requiredRoles={['super-admin']} redirectTo="/unauthorized">
      <Fragment>
        <PageNavbar />
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarActions>
                <Button variant="outline" onClick={handleBackToTemplates}>
                  <ArrowLeft /> Back to Templates
                </Button>
              </ToolbarActions>
            </ToolbarHeading>
            <ToolbarActions>
              <Button variant="primary" onClick={handleCreateCategory}>
                <Plus /> Create Category
              </Button>
            </ToolbarActions>
          </Toolbar>
        </Container>
        <Container>
          <CategoryManagement
            onEditCategory={handleEditCategory}
            refreshKey={refreshKey}
          />
        </Container>

        {/* Category Form Modal */}
        {showForm && (
          <CategoryForm
            category={editingCategory}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        )}
      </Fragment>
    </RouteGuard>
  );
}

export default CategoryManagementPage;
