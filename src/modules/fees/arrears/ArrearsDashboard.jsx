import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Container, Form, Button } from 'react-bootstrap';
import { Download, Bell } from 'lucide-react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import KPISection from './components/KPISection';
import ArrearsCharts from './components/ArrearsCharts';
import ArrearsTable from './components/ArrearsTable';
import { feesService } from '../../../services/feesService';

const ArrearsDashboard = () => {
    const [filter, setFilter] = useState({ year: 'All', term: 'All', class: 'All', intake: 'All' });

    // Data state
    const [data, setData] = useState({
        kpis: {},
        arrearsByClass: [],
        arrearsByIntake: [],
    });
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter options from database
    const [filterOptions, setFilterOptions] = useState({
        academicYears: [],
        terms: [],
        grades: [],
        intakes: [],
    });

    // Loading & error states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch filter options on mount
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                console.log('🎛️ Fetching initial filter options...');
                const options = await feesService.getFilterOptions();
                console.log('📋 Filter options received:', options);
                setFilterOptions({
                    academicYears: options.academic_years || [],
                    terms: options.terms || [],
                    grades: options.grades || [],
                    intakes: options.intakes || [],
                });

                // Set default filter to first academic year and term if available
                if (options.academic_years?.length > 0) {
                    console.log('✅ Auto-selecting year:', options.academic_years[0].name);
                    setFilter(prev => ({
                        ...prev,
                        year: options.academic_years[0].name
                    }));
                }
                if (options.terms?.length > 0) {
                    console.log('✅ Auto-selecting term:', options.terms[0].name);
                    setFilter(prev => ({
                        ...prev,
                        term: options.terms[0].name
                    }));
                }
            } catch (err) {
                console.error('❌ Error fetching filter options:', err);
            }
        };

        fetchFilterOptions();
    }, []);

    // Refetch terms when academic year changes (cascading filter)
    useEffect(() => {
        const fetchTermsForYear = async () => {
            // Skip if year is 'All' or not set yet (initial state)
            if (!filter.year || filter.year === 'All') {
                return;
            }

            try {
                const options = await feesService.getFilterOptions(filter.year);
                setFilterOptions(prev => ({
                    ...prev,
                    terms: options.terms || [],
                }));

                // Auto-select first term for selected year, or 'All' if no terms
                if (options.terms?.length > 0) {
                    setFilter(prev => ({
                        ...prev,
                        term: options.terms[0].name
                    }));
                } else {
                    // No terms for this year, default to 'All'
                    setFilter(prev => ({ ...prev, term: 'All' }));
                }
            } catch (err) {
                console.error('Error fetching terms for year:', err);
                // On error, reset to 'All'
                setFilter(prev => ({ ...prev, term: 'All' }));
            }
        };

        // Use a flag to skip the initial mount
        fetchTermsForYear();
    }, [filter.year]);

    // Fetch data when filters change
    useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('🔍 Fetching arrears data with filters:', filter);

                // Fetch summary (KPIs + Charts)
                const summaryData = await feesService.getArrearsSummary(filter);
                console.log('📊 Summary data received:', summaryData);
                setData(summaryData);

                // Fetch students list
                const studentsData = await feesService.getStudentsInArrears(filter, searchQuery);
                console.log('👥 Students data received:', studentsData);
                setStudents(studentsData.results);

                // Check if data is empty
                if (studentsData.results.length === 0) {
                    console.warn('⚠️ No students with arrears found for filters:', filter);
                }

            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('❌ Error fetching arrears data:', err);
                    setError(err.message || 'Failed to load arrears data');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Cleanup: abort request if component unmounts or filter changes
        return () => controller.abort();
    }, [filter, searchQuery]);

    return (
        <DashboardLayout title="Student Arrears Dashboard">
            <Container fluid className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="mb-1 fw-bold text-dark">Student Arrears Dashboard</h2>
                        <p className="text-muted mb-0">Overview of outstanding fees and student debts</p>
                    </div>
                    <div className="d-flex gap-2">
                        <Form.Select
                            className="w-auto"
                            value={filter.year}
                            onChange={(e) => setFilter({ ...filter, year: e.target.value })}
                        >
                            <option value="All">All Years</option>
                            {filterOptions.academicYears.map(year => (
                                <option key={year.id} value={year.name}>{year.name}</option>
                            ))}
                        </Form.Select>
                        <Form.Select
                            className="w-auto"
                            value={filter.term}
                            onChange={(e) => setFilter({ ...filter, term: e.target.value })}
                            disabled={filterOptions.terms.length === 0 && filter.year !== 'All'}
                        >
                            <option value="All">All Terms</option>
                            {filterOptions.terms.map(term => (
                                <option key={term.id} value={term.name}>{term.name}</option>
                            ))}
                        </Form.Select>
                        <Button variant="outline-primary" className="d-flex align-items-center gap-2">
                            <Download size={18} /> Export
                        </Button>
                        <Button variant="primary" className="d-flex align-items-center gap-2">
                            <Bell size={18} /> Send Reminders
                        </Button>
                    </div>
                </div>

                {/* KPI Section */}
                <div className="mb-4">
                    <KPISection data={data.kpis} />
                </div>

                {/* Charts Section */}
                <Row className="mb-4 g-4">
                    <Col md={8}>
                        <Card className="h-100 shadow-sm border-0">
                            <Card.Header className="bg-white border-bottom-0 pt-3">
                                <h5 className="mb-0 fw-bold">Arrears Distribution by Class</h5>
                            </Card.Header>
                            <Card.Body>
                                <ArrearsCharts type="distribution" data={data.arrearsByClass} />
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="h-100 shadow-sm border-0">
                            <Card.Header className="bg-white border-bottom-0 pt-3">
                                <h5 className="mb-0 fw-bold">Arrears by Intake</h5>
                            </Card.Header>
                            <Card.Body>
                                <ArrearsCharts type="intake" data={data.arrearsByIntake} />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Detailed Table Section */}
                <Card className="shadow-sm border-0">
                    <Card.Header className="bg-white py-3 border-bottom-0">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">Detailed Student Arrears</h5>
                            <div className="d-flex gap-2">
                                <Form.Control
                                    type="text"
                                    placeholder="Search student..."
                                    className="w-auto"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Form.Select className="w-auto" size="sm">
                                    <option>All Classes</option>
                                    <option>Form 1</option>
                                    <option>Form 2</option>
                                </Form.Select>
                            </div>
                        </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                        <ArrearsTable students={students} />
                    </Card.Body>
                </Card>

            </Container>
        </DashboardLayout>
    );
};

export default ArrearsDashboard;
