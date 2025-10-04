'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {
    CheckCircle,
    Clock,
    Edit,
    HelpCircle,
    MoreHorizontal,
    Trash2,
    XCircle,
    Download,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/providers/toast-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardTable } from '@/components/ui/card';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import {
    DataGridTable,
    DataGridTableRowSelect,
    DataGridTableRowSelectAll,
} from '@/components/ui/data-grid-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ConfirmationDialog } from './confirmation-dialog';
import { EditGuestModal } from './edit-guest-modal';
import * as XLSX from 'xlsx';

const GuestListTable = ({
    event,
    searchQuery,
    onGuestsUpdate,
    selectedGuests,
    onSelectedGuestsChange,
}) => {
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [sorting, setSorting] = useState([{ id: 'name', desc: false }]);
    const [rowSelection, setRowSelection] = useState({});
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingGuest, setEditingGuest] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        isOpen: false,
        guestId: null,
        guestName: '',
    });
    const { toastSuccess, toastError, toastWarning } = useToast();

    useEffect(() => {
        if (event?.id) {
            fetchGuests();
        }
    }, [event?.id]);

    useEffect(() => {
        const newRowSelection = {};
        selectedGuests.forEach((guestId) => {
            newRowSelection[guestId] = true;
        });
        setRowSelection(newRowSelection);
    }, [selectedGuests]);

    const fetchGuests = async () => {
        try {
            setLoading(true);
            const response = await apiFetch(`/api/events/guests?eventId=${event.id}`);
            if (!response.ok) throw new Error(`Failed to fetch guests: ${response.status}`);
            const data = await response.json();
            const guestsData = data.data || [];
            setGuests(guestsData);
            if (onGuestsUpdate) onGuestsUpdate(guestsData);
        } catch (error) {
            console.error('Error fetching guests:', error);
            setGuests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGuest = (guestId, guestName) => {
        setDeleteConfirmation({
            isOpen: true,
            guestId,
            guestName,
        });
    };

    const confirmDeleteGuest = async () => {
        const { guestId } = deleteConfirmation;
        try {
            const response = await apiFetch(`/api/events/guests?guestId=${guestId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete guest');
            const data = await response.json();
            if (data.success) {
                toastSuccess(data.message);
                fetchGuests();
            } else {
                toastError(data.error || 'Failed to delete guest');
            }
        } catch (error) {
            console.error('Error deleting guest:', error);
            toastError('Failed to delete guest. Please try again.');
        }
    };

    const closeDeleteConfirmation = () => {
        setDeleteConfirmation({
            isOpen: false,
            guestId: null,
            guestName: '',
        });
    };

    const handleEditGuest = (guest) => {
        setEditingGuest(guest);
        setIsEditModalOpen(true);
    };

    const handleGuestUpdated = () => {
        fetchGuests();
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingGuest(null);
    };

    const filteredData = useMemo(() => {
        return guests.filter((guest) => {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                !searchQuery ||
                guest.name?.toLowerCase().includes(searchLower) ||
                guest.email?.toLowerCase().includes(searchLower);
            return matchesSearch;
        });
    }, [guests, searchQuery]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'CONFIRMED':
                return <CheckCircle className="size-4 text-green-600 dark:text-green-400" />;
            case 'DECLINED':
                return <XCircle className="size-4 text-red-600 dark:text-red-400" />;
            case 'MAYBE':
                return <HelpCircle className="size-4 text-yellow-600 dark:text-yellow-400" />;
            default:
                return <Clock className="size-4 text-gray-600 dark:text-gray-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'CONFIRMED':
                return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
            case 'DECLINED':
                return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
            case 'MAYBE':
                return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
            default:
                return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600';
        }
    };

    const handleExportExcel = () => {
        const exportData = filteredData.map((guest) => ({
            Name: guest.name,
            Email: guest.email,
            RSVP: guest.status || 'PENDING',
            'Total Adults': guest.status === 'PENDING' || !guest.status ? '-' : guest.adults ?? '-',
            'Total Kids': guest.status === 'PENDING' || !guest.status ? '-' : guest.children ?? '-',
            Invitation: guest.invitedAt ? 'Sent' : 'Not Sent',
            Notes: guest.response ?? '',
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Guests');
        XLSX.writeFile(workbook, `GuestList_${event?.name || 'Event'}.xlsx`);
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: 'id',
                accessorFn: (row) => row.id,
                header: () => <DataGridTableRowSelectAll />,
                cell: ({ row }) => <DataGridTableRowSelect row={row} />,
                enableSorting: false,
                enableHiding: false,
                enableResizing: false,
                size: 51,
                meta: { cellClassName: '' },
            },
            {
                id: 'name',
                accessorFn: (row) => row.name,
                header: ({ column }) => <DataGridColumnHeader title="Guest" column={column} />,
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {row.original.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-900 dark:text-white">
                                {row.original.name}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {row.original.email}
                            </span>
                        </div>
                    </div>
                ),
                enableSorting: true,
                size: 360,
                meta: { cellClassName: '' },
            },
            {
                id: 'status',
                accessorFn: (row) => row.status,
                header: ({ column }) => <DataGridColumnHeader title="RSVP" column={column} />,
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        {getStatusIcon(row.original.status)}
                        <Badge
                            className={`${getStatusColor(row.original.status)} border font-medium px-3 py-1`}
                        >
                            {row.original.status || 'PENDING'}
                        </Badge>
                    </div>
                ),
                enableSorting: true,
                size: 200,
                meta: { cellClassName: '' },
            },
            {
                id: 'adults',
                accessorFn: (row) => row.adults,
                header: ({ column }) => <DataGridColumnHeader title="Total Adults" column={column} />,
                cell: ({ row }) =>
                    row.original.status === 'PENDING' || !row.original.status ? (
                        <span>-</span>
                    ) : (
                        <span>{row.original.adults ?? '-'}</span>
                    ),
                enableSorting: true,
                size: 120,
                meta: { cellClassName: '' },
            },
            {
                id: 'children',
                accessorFn: (row) => row.children,
                header: ({ column }) => <DataGridColumnHeader title="Total Kids" column={column} />,
                cell: ({ row }) =>
                    row.original.status === 'PENDING' || !row.original.status ? (
                        <span>-</span>
                    ) : (
                        <span>{row.original.children ?? '-'}</span>
                    ),
                enableSorting: true,
                size: 120,
                meta: { cellClassName: '' },
            },
            {
                id: 'invitation',
                accessorFn: (row) => row.invitation,
                header: ({ column }) => <DataGridColumnHeader title="Invitation" column={column} />,
                cell: ({ row }) => {
                    const isSent = row.original.invitedAt;
                    return (
                        <div className="flex items-center gap-2">
                            <div
                                className={`w-2 h-2 rounded-full ${isSent
                                        ? 'bg-green-500 dark:bg-green-400'
                                        : 'bg-gray-400 dark:bg-gray-500'
                                    }`}
                            ></div>
                            <span
                                className={`font-medium ${isSent
                                        ? 'text-green-700 dark:text-green-300'
                                        : 'text-gray-600 dark:text-gray-400'
                                    }`}
                            >
                                {isSent ? 'Sent' : 'Not Sent'}
                            </span>
                        </div>
                    );
                },
                enableSorting: true,
                size: 200,
                meta: { cellClassName: '' },
            },
            {
                id: 'notes',
                accessorFn: (row) => row.notes,
                header: ({ column }) => <DataGridColumnHeader title="Notes" column={column} />,
                cell: ({ row }) => (
                    <div className="max-w-xs">
                        {row.original.response ? (
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                    {row.original.response}
                                </p>
                            </div>
                        ) : (
                            <span className="text-gray-400 dark:text-gray-500 italic">No response</span>
                        )}
                    </div>
                ),
                enableSorting: true,
                size: 200,
                meta: { cellClassName: '' },
            },
            {
                id: 'actions',
                accessorFn: (row) => row.id,
                header: () => (
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Actions</span>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() => handleEditGuest(row.original)}
                                    className="cursor-pointer"
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        handleDeleteGuest(row.original.id, row.original.name)
                                    }
                                    className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={async () => {
                                        const link = `${window.location.origin}/invitation/${event.id}/${row.original.id}`;
                                        try {
                                            await navigator.clipboard.writeText(link);
                                            toastSuccess('Invitation link copied!');
                                        } catch {
                                            toastError('Failed to copy link');
                                        }
                                    }}
                                    className="cursor-pointer"
                                >
                                    <HelpCircle className="mr-2 h-4 w-4" />
                                    Copy Invitation Link
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ),
                enableSorting: false,
                enableHiding: false,
                size: 100,
                meta: { cellClassName: '' },
            },
        ],
        [event]
    );

    const table = useReactTable({
        columns,
        data: filteredData,
        pageCount: Math.ceil((filteredData?.length || 0) / pagination.pageSize),
        getRowId: (row) => String(row.id),
        state: {
            pagination,
            sorting,
            rowSelection,
        },
        columnResizeMode: 'onChange',
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        enableRowSelection: true,
        onRowSelectionChange: (updaterOrValue) => {
            const newSelection =
                typeof updaterOrValue === 'function'
                    ? updaterOrValue(rowSelection)
                    : updaterOrValue;
            setRowSelection(newSelection);
            const selectedIds = Object.keys(newSelection).filter((key) => newSelection[key]);
            onSelectedGuestsChange(selectedIds);
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    if (loading) {
        return (
            <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 w-full">
                <div className="flex flex-col items-center justify-center h-48 space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400"></div>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">Loading guests...</p>
                </div>
            </Card>
        );
    }

    return (
        <>
            <Card className="p-4 md:p-6 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 border-gray-200 dark:border-gray-700 w-full">
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                <svg
                                    className="w-4 h-4 text-gray-600 dark:text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Guest List
                            </h3>
                        </div>
                        <div className="flex items-center gap-2 mt-2 md:mt-0">
                            <Badge
                                variant="outline"
                                className="bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                            >
                                {filteredData.length}{' '}
                                {filteredData.length === 1 ? 'Guest' : 'Guests'}
                            </Badge>
                            <Button
                                variant="outline"
                                size="sm"
                                className="ml-2 flex items-center gap-1"
                                onClick={handleExportExcel}
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </Button>
                        </div>
                    </div>

                    <DataGrid
                        table={table}
                        recordCount={filteredData?.length || 0}
                        tableLayout={{
                            columnsPinnable: true,
                            columnsMovable: true,
                            columnsVisibility: true,
                            cellBorder: false,
                        }}
                    >
                        <Card className="border-0 shadow-sm bg-white dark:bg-gray-800 w-full">
                            <CardTable>
                                <div className="overflow-x-auto w-full">
                                    <ScrollArea
                                        style={{
                                            height: '480px',
                                            minHeight: '320px',
                                            maxHeight: '480px',
                                            overflowY: 'auto',
                                        }}
                                    >
                                        <div className="min-w-full">
                                            <DataGridTable />
                                        </div>
                                        <ScrollBar orientation="horizontal" />
                                    </ScrollArea>
                                </div>
                                <div className="flex flex-col md:flex-row items-center justify-between px-4 py-2 border-t bg-gray-50 dark:bg-gray-900 gap-2">
                                    <div>
                                        Page {pagination.pageIndex + 1} of {table.getPageCount()}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => table.setPageIndex(0)}
                                            disabled={!table.getCanPreviousPage()}
                                        >
                                            First
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => table.previousPage()}
                                            disabled={!table.getCanPreviousPage()}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => table.nextPage()}
                                            disabled={!table.getCanNextPage()}
                                        >
                                            Next
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                            disabled={!table.getCanNextPage()}
                                        >
                                            Last
                                        </Button>
                                    </div>
                                    <div>
                                        <select
                                            value={pagination.pageSize}
                                            onChange={(e) =>
                                                setPagination({
                                                    ...pagination,
                                                    pageSize: Number(e.target.value),
                                                })
                                            }
                                            className="border rounded px-2 py-1 bg-white dark:bg-gray-800"
                                        >
                                            {[10, 20, 50, 100].map((size) => (
                                                <option key={size} value={size}>
                                                    Show {size}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </CardTable>
                        </Card>
                    </DataGrid>
                </div>
            </Card>

            <EditGuestModal
                guest={editingGuest}
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                onGuestUpdated={handleGuestUpdated}
            />

            <ConfirmationDialog
                isOpen={deleteConfirmation.isOpen}
                onClose={closeDeleteConfirmation}
                onConfirm={confirmDeleteGuest}
                title="Delete Guest"
                message={`Are you sure you want to delete ${deleteConfirmation.guestName}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />
        </>
    );
};

export { GuestListTable };