import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  List,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { toast } from 'react-toastify';

// Helper functions
const formatNumber = (value) => {
  if (!value) return '';
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const unformatNumber = (value) => {
  if (!value) return '';
  return value.toString().replace(/,/g, '');
};

// Component
const Calculator = () => {
  const [formData, setFormData] = useState({
    title: '',
    date: null,
    location: '',
    participants: '',
    feePerPerson: '',
    materials: [],
    venueFee: '',
    platformFee: '',
    targetProfit: '',
  });

  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem('calculationHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [historyDialog, setHistoryDialog] = useState(false);
  const [calculationResult, setCalculationResult] = useState(null);
  const [expandedMaterials, setExpandedMaterials] = useState(new Set());

  const addMaterial = () => {
    setFormData({
      ...formData,
      materials: [...formData.materials, { name: '', price: '', quantity: '' }],
    });
  };

  const removeMaterial = (index) => {
    const newMaterials = formData.materials.filter((_, i) => i !== index);
    setFormData({ ...formData, materials: newMaterials });
  };

  const deleteHistoryItem = (index) => {
    const newHistory = history.filter((_, i) => i !== index);
    setHistory(newHistory);
    localStorage.setItem('calculationHistory', JSON.stringify(newHistory));
    toast.success('삭제되었습니다!');
  };

  // Update the handlers for numeric inputs
  const handleNumericChange = (field, value) => {
    const numericValue = unformatNumber(value);
    setFormData({ ...formData, [field]: numericValue });
  };

  const updateMaterial = (index, field, value) => {
    const newMaterials = [...formData.materials];
    const updatedValue = field === 'name' ? value : unformatNumber(value);
    newMaterials[index] = { ...newMaterials[index], [field]: updatedValue };
    setFormData({ ...formData, materials: newMaterials });
  };

  const calculate = () => {
    if (!formData.title || !formData.date || !formData.participants || !formData.feePerPerson) {
      toast.error('필수 항목을 모두 입력해주세요!');
      return;
    }

    const totalRevenue = Number(formData.participants) * Number(formData.feePerPerson);
    const materialsCost = formData.materials.reduce(
      (sum, material) => sum + (Number(material.price) * Number(material.quantity) || 0),
      0
    );
    const platformFeeAmount = (totalRevenue * (Number(formData.platformFee) || 0)) / 100;
    const venueFee = Number(formData.venueFee) || 0;
    const netProfit = totalRevenue - materialsCost - platformFeeAmount - venueFee;

    const result = {
      totalRevenue,
      materialsCost,
      platformFeeAmount,
      venueFee,
      netProfit,
    };

    if (formData.targetProfit && netProfit < Number(formData.targetProfit)) {
      const additionalRequired = Number(formData.targetProfit) - netProfit;
      const newFeePerPerson = Math.ceil(
        (Number(formData.feePerPerson) + additionalRequired / formData.participants)
      );
      result.suggestedFee = newFeePerPerson;
    }

    setCalculationResult(result);
  };

  const saveCalculation = () => {
    if (calculationResult) {
      const historyItem = {
        ...formData,
        ...calculationResult,
        timestamp: new Date(),
      };
      const newHistory = [historyItem, ...history];
      setHistory(newHistory);
      localStorage.setItem('calculationHistory', JSON.stringify(newHistory));
      
      // Reset form and calculation result
      setFormData({
        title: '',
        date: null,
        location: '',
        participants: '',
        feePerPerson: '',
        materials: [],
        venueFee: '',
        platformFee: '',
        targetProfit: '',
      });
      setCalculationResult(null);
      
      toast.success('계산 결과가 저장되었습니다!');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative',
        mb: 4 
      }}>
        <Typography variant="h4" sx={{ 
          background: 'linear-gradient(45deg, #2196f3, #1976d2)',
          backgroundClip: 'text',
          textFillColor: 'transparent',
          fontWeight: 800,
        }}>
          모임 수익 계산기
        </Typography>
        <IconButton 
          onClick={() => setHistoryDialog(true)}
          sx={{ 
            position: 'absolute',
            right: 0,
            color: '#2196f3',
            '&:hover': {
              backgroundColor: 'rgba(33, 150, 243, 0.04)',
            },
          }}
        >
          <HistoryIcon />
        </IconButton>
      </Box>

      {/* Add Guide Section */}
      <Paper elevation={1} sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 3,
        backgroundColor: '#fafafa',
        border: '1px solid #edf2f7',
      }}>
        <Typography variant="h6" sx={{ 
          mb: 2, 
          fontWeight: 600, 
          color: '#424242',
          fontSize: '1rem',
          textAlign: 'left'  // 추가
        }}>
          계산기 활용 방법
        </Typography>
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: 0.25,
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            p: 0.75,
            borderRadius: 1,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            }
          }}>
            <Box sx={{ 
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: '#e3f2fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#1976d2',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}>1</Box>
            <Typography sx={{ 
              color: '#444', 
              fontSize: '0.9rem',
              lineHeight: 1.5,
            }}>
              모임 참가비로 얻을 수 있는 <strong>예상 총 수입</strong>을 계산해드려요
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            p: 0.75,
            borderRadius: 1,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            }
          }}>
            <Box sx={{ 
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: '#e3f2fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#1976d2',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}>2</Box>
            <Typography sx={{ 
              color: '#444', 
              fontSize: '0.9rem',
              lineHeight: 1.5,
            }}>
              재료비, 대관료 등을 제외한 <strong>실제 순수익</strong>을 확인할 수 있어요
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            p: 0.75,
            borderRadius: 1,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            }
          }}>
            <Box sx={{ 
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: '#e3f2fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#1976d2',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}>3</Box>
            <Typography sx={{ 
              color: '#444', 
              fontSize: '0.9rem',
              lineHeight: 1.5,
            }}>
              목표 수익 달성을 위한 <strong>적정 참가비</strong>를 추천해드려요
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            p: 0.75,
            borderRadius: 1,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            }
          }}>
            <Box sx={{ 
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: '#e3f2fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#1976d2',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}>4</Box>
            <Typography sx={{ 
              color: '#444', 
              fontSize: '0.9rem',
              lineHeight: 1.5,
            }}>
              계산 결과를 저장하여 <strong>수익 이력</strong>을 관리할 수 있어요
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ 
        p: 4,
        borderRadius: 3,
        backgroundColor: '#ffffff',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      }}>
        {/* Remove the title Typography from here */}
        
        {/* Basic Info Section */}
        <Box sx={{ mb: 5 }}>
          <Stack spacing={3}>
            <TextField
              required
              fullWidth
              label="모임 제목"
              placeholder="모임 제목을 입력하세요"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <DatePicker
                label="모임 날짜"
                value={formData.date}
                onChange={(date) => setFormData({ ...formData, date })}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
              <TextField
                fullWidth
                label="모임 장소"
                placeholder="모임 장소를 입력하세요"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </Box>
          </Stack>
        </Box>

        {/* Participation Info Section */}
        <Box sx={{ mb: 5 }}>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                required
                fullWidth
                label="참여인원 수"
                type="text"
                value={formatNumber(formData.participants)}
                onChange={(e) => handleNumericChange('participants', e.target.value)}
              />
              <TextField
                required
                fullWidth
                label="1인당 참가 비용"
                type="text"
                value={formatNumber(formData.feePerPerson)}
                onChange={(e) => handleNumericChange('feePerPerson', e.target.value)}
              />
            </Box>
          </Stack>
        </Box>

        {/* Materials Section */}
        <Box sx={{ mb: 5 }}>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
                재료 목록
              </Typography>
              <Button 
                variant="outlined" 
                onClick={addMaterial}
                startIcon={<AddIcon />}
                size="small"
              >
                재료 추가
              </Button>
              <Typography sx={{ ml: 'auto', color: '#666', fontSize: '0.875rem' }}>
                총 재료비: {formData.materials.length > 0 ? formatNumber(
                  formData.materials.reduce((sum, m) => {
                    const price = Number(unformatNumber(m.price)) || 0;
                    const quantity = Number(unformatNumber(m.quantity)) || 0;
                    return sum + (price * quantity);
                  }, 0)
                ) : '0'}원
              </Typography>
            </Box>
            {formData.materials.map((material, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  label="재료명"
                  value={material.name}
                  onChange={(e) => updateMaterial(index, 'name', e.target.value)}
                />
                <TextField
                  type="text"
                  label="단가"
                  value={formatNumber(material.price)}
                  onChange={(e) => updateMaterial(index, 'price', e.target.value)}
                />
                <TextField
                  type="text"
                  label="수량"
                  value={formatNumber(material.quantity)}
                  onChange={(e) => updateMaterial(index, 'quantity', e.target.value)}
                />
                <IconButton onClick={() => removeMaterial(index)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Additional Costs Section */}
        <Box sx={{ mb: 5 }}>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="장소 대관료"
                type="text"
                value={formatNumber(formData.venueFee)}
                onChange={(e) => handleNumericChange('venueFee', e.target.value)}
              />
              <Box sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  label="플랫폼 수수료 (%)"
                  type="text"
                  value={formatNumber(formData.platformFee)}
                  onChange={(e) => handleNumericChange('platformFee', e.target.value)}
                />
                <Typography 
                  sx={{ 
                    mt: 1, 
                    mb: 2, 
                    fontSize: '0.875rem',
                    height: '1.5em',
                    color: formData.platformFee && (!formData.participants || !formData.feePerPerson) ? '#f44336' : '#666',
                    textAlign: 'right'
                  }}
                >
                  {formData.platformFee ? (
                    (!formData.participants || !formData.feePerPerson) ? 
                      "참여인원 수와 1인당 참가 비용을 입력해주세요" :
                      `플랫폼 수수료: ${formatNumber(Math.floor(
                        Number(unformatNumber(formData.participants)) * 
                        Number(unformatNumber(formData.feePerPerson)) * 
                        Number(unformatNumber(formData.platformFee)) / 100
                      ))}원`
                  ) : "플랫폼 수수료: 0원"}
                </Typography>
              </Box>
            </Box>
            <TextField
              fullWidth
              label="목표 수익 금액"
              type="text"
              value={formatNumber(formData.targetProfit)}
              onChange={(e) => handleNumericChange('targetProfit', e.target.value)}
            />
          </Stack>
        </Box>

        {/* Calculate Button */}
        <Button variant="contained" onClick={calculate} fullWidth sx={{ 
            mt: 4,
            mb: 2,
            py: 2,
            borderRadius: 2,
            background: 'linear-gradient(45deg, #2196f3, #1976d2)',
            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976d2, #1565c0)',
              boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
            },
          }}
        >
          계산하기
        </Button>
      </Paper>

      {calculationResult && (
        <Paper 
          elevation={2} 
          sx={{ 
            p: 4,
            mt: 3,
            borderRadius: 3,
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: '#2196f3', fontWeight: 'bold' }}>
            계산 결과
          </Typography>
          <Typography sx={{ mb: 1, color: '#333' }}>총 수입: {calculationResult.totalRevenue.toLocaleString()}원</Typography>
          <Typography sx={{ mb: 1, color: '#333' }}>재료비: {calculationResult.materialsCost.toLocaleString()}원</Typography>
          <Typography sx={{ mb: 1, color: '#333' }}>대관료: {calculationResult.venueFee.toLocaleString()}원</Typography>
          <Typography sx={{ mb: 1, color: '#333' }}>플랫폼 수수료: {calculationResult.platformFeeAmount.toLocaleString()}원</Typography>
          <Typography sx={{ mb: 1, fontWeight: 'bold', color: '#333' }}>순수익: {calculationResult.netProfit.toLocaleString()}원</Typography>
          {calculationResult.suggestedFee && (
            <Typography sx={{ mt: 2, color: '#f50057', fontWeight: 'bold' }}>
              목표 수익 달성을 위한 1인당 참가비: {calculationResult.suggestedFee.toLocaleString()}원
            </Typography>
          )}
          <Button
            variant="contained"
            color="secondary"
            onClick={saveCalculation}
            fullWidth
            sx={{ mt: 2 }}
          >
            결과 저장하기
          </Button>
        </Paper>
      )}

      {/* Remove the history button */}

      <Dialog
        open={historyDialog}
        onClose={() => setHistoryDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          borderBottom: '2px dashed #ddd',
          fontWeight: 'bold',
          position: 'relative',
          pb: 2
        }}>
          계산 히스토리
          <IconButton
            onClick={() => setHistoryDialog(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: '#666',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {history.length === 0 ? (
            <Typography sx={{ textAlign: 'center', py: 3, color: '#666' }}>
              저장된 계산 결과가 없습니다.
            </Typography>
          ) : (
            <List sx={{ px: 2 }}>
              {history.map((item, index) => (
                <ListItem 
                  key={index}
                  sx={{ 
                    flexDirection: 'column', 
                    alignItems: 'stretch',
                    backgroundColor: '#ffffff',
                    borderRadius: 2,
                    mb: 3,
                    p: 0,
                    overflow: 'hidden',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    '&:hover': {
                      border: '1px solid #bbdefb',
                      backgroundColor: '#fafafa',
                    },
                  }}
                >
                  {/* Header */}
                  <Box sx={{ 
                    p: 3,
                    pb: 2,
                    borderBottom: '1px solid #e3f2fd',
                    backgroundColor: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative'
                  }}>
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      position: 'relative',
                      mb: 1
                    }}>
                      <Typography sx={{ 
                        fontSize: '1.2rem',
                        fontWeight: 500,
                        color: '#333',
                      }}>
                        {item.title}
                      </Typography>
                      <IconButton 
                        onClick={() => deleteHistoryItem(index)}
                        size="small"
                        sx={{ 
                          position: 'absolute',
                          right: 0,
                          p: 0.5,
                          color: '#bdbdbd',
                          '&:hover': {
                            color: '#f44336',
                          }
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: '1.1rem' }} />
                      </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Typography sx={{ fontSize: '0.85rem', color: '#757575' }}>
                        {new Date(item.timestamp).toLocaleDateString()}
                      </Typography>
                      {item.location && (
                        <Typography sx={{ fontSize: '0.85rem', color: '#757575' }}>
                          {item.location}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Content */}
                  <Box sx={{ p: 3, backgroundColor: '#fff' }}>
                    {/* Key Information */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      mb: 3,
                      pb: 2,
                      borderBottom: '1px solid #f5f5f5'
                    }}>
                      <Box>
                        <Typography sx={{ fontSize: '0.9rem', color: '#666', mb: 0.5 }}>총 수입</Typography>
                        <Typography sx={{ fontSize: '1.25rem', fontWeight: 500 }}>
                          {formatNumber(item.totalRevenue)}원
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontSize: '0.9rem', color: '#666', mb: 0.5 }}>순수익</Typography>
                        <Typography sx={{ 
                          fontSize: '1.25rem', 
                          fontWeight: 500,
                          color: item.netProfit >= 0 ? '#2196f3' : '#f44336'
                        }}>
                          {formatNumber(item.netProfit)}원
                        </Typography>
                      </Box>
                    </Box>

                    {/* Details */}
                    <Box sx={{ mb: 2 }}>
                      <Typography sx={{ 
                        fontSize: '0.9rem', 
                        color: '#333', 
                        mb: 1.5,
                        fontWeight: 500,
                      }}>
                        참가 정보
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 0.5, mb: 0.5 }}>
                        <Typography sx={{ color: '#555', fontSize: '0.9rem' }}>참가자 수</Typography>
                        <Typography sx={{ textAlign: 'right', minWidth: '100px', fontSize: '0.9rem' }}>
                          {formatNumber(item.participants)}명
                        </Typography>
                        <Typography sx={{ color: '#555', fontSize: '0.9rem' }}>1인당 참가비</Typography>
                        <Typography sx={{ textAlign: 'right', minWidth: '100px', fontSize: '0.9rem' }}>
                          {formatNumber(item.feePerPerson)}원
                        </Typography>
                      </Box>
                    </Box>

                    {/* Expenses */}
                    <Box sx={{ mt: 4 }}>
                      <Typography sx={{ 
                        fontSize: '0.9rem', 
                        color: '#333', 
                        mb: 1.5,
                        fontWeight: 500,
                      }}>
                        지출 내역
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 0.5 }}>
                        {item.materials.length > 0 && (
                          <>
                            <Box sx={{ 
                              gridColumn: '1 / -1',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              cursor: 'pointer',
                              mb: 1
                            }}
                            onClick={() => {
                              const newState = new Set(expandedMaterials);
                              if (newState.has(index)) {
                                newState.delete(index);
                              } else {
                                newState.add(index);
                              }
                              setExpandedMaterials(newState);
                            }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography sx={{ color: '#555', fontSize: '0.9rem', mr: 1 }}>
                                  총 재료비
                                </Typography>
                                {expandedMaterials.has(index) ? 
                                  <KeyboardArrowUpIcon sx={{ fontSize: '1rem', color: '#999' }} /> : 
                                  <KeyboardArrowDownIcon sx={{ fontSize: '1rem', color: '#999' }} />
                                }
                              </Box>
                              <Typography sx={{ textAlign: 'right', fontSize: '0.9rem' }}>
                                - {formatNumber(item.materialsCost)}원
                              </Typography>
                            </Box>
                            {expandedMaterials.has(index) && (
                              <Box sx={{ 
                                gridColumn: '1 / -1',
                                pl: 2,
                                mb: 1,
                                borderLeft: '2px solid #eee'
                              }}>
                                {item.materials.map((material, idx) => (
                                  <Box key={idx} sx={{ 
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    mb: 0.5
                                  }}>
                                    <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>
                                      {material.name} ({formatNumber(material.quantity)}개)
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>
                                      {formatNumber(material.price * material.quantity)}원
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            )}
                          </>
                        )}
                        {item.venueFee > 0 && (
                          <>
                            <Typography sx={{ color: '#555', fontSize: '0.9rem' }}>대관료</Typography>
                            <Typography sx={{ textAlign: 'right', minWidth: '100px', fontSize: '0.9rem' }}>
                              - {formatNumber(item.venueFee)}원
                            </Typography>
                          </>
                        )}
                        {item.platformFeeAmount > 0 && (
                          <>
                            <Typography sx={{ color: '#555', fontSize: '0.9rem' }}>플랫폼 수수료</Typography>
                            <Typography sx={{ textAlign: 'right', minWidth: '100px', fontSize: '0.9rem' }}>
                              - {formatNumber(item.platformFeeAmount)}원
                            </Typography>
                          </>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Calculator;