'use client';

import React, { Fragment, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/components/common/toolbar';
import {
  ToolbarDescription,
  ToolbarPageTitle,
} from '@/app/components/partials/common/toolbar';
import { RouteGuard } from '@/components/common/route-guard';
import { PageNavbar } from '../../account/page-navbar';
import { CategoryManagement } from './content';
import { CategoryForm } from './components/CategoryForm';

function CategoryManagementPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

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

  return (
    <RouteGuard 
      requiredRoles={['super-admin']}
      redirectTo="/unauthorized"
    >
      <Fragment>
        <PageNavbar />
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
              <ToolbarDescription>Template Category Management</ToolbarDescription>
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
          />
        </Container>

        {/* Category Form Modal */}
        {showForm && (
          <CategoryForm 
            category={editingCategory}
            onClose={handleFormClose}
            onSuccess={handleFormClose}
          />
        )}
      </Fragment>
    </RouteGuard>
  );
}

export default CategoryManagementPage;
