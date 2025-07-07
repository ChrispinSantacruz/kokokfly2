const mongoose = require('mongoose');

// Esquema para scores individuales
const scoreSchema = new mongoose.Schema({
  playerName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 10000
  },
  level: {
    type: String,
    required: true,
    enum: ['easy', 'hard']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  date: {
    type: String,
    required: true
  },
  // Para identificar records únicos por jugador y nivel
  playerLevel: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true // Añade createdAt y updatedAt automáticamente
});

// Índice compuesto para búsquedas eficientes
scoreSchema.index({ level: 1, score: -1 });
scoreSchema.index({ playerName: 1, level: 1 });

// Método estático para obtener leaderboards
scoreSchema.statics.getLeaderboards = async function() {
  const easyScores = await this.find({ level: 'easy' })
    .sort({ score: -1 })
    .limit(100)
    .select('-_id -__v -createdAt -updatedAt -playerLevel')
    .lean();

  const hardScores = await this.find({ level: 'hard' })
    .sort({ score: -1 })
    .limit(100)
    .select('-_id -__v -createdAt -updatedAt -playerLevel')
    .lean();

  return {
    easy: easyScores,
    hard: hardScores
  };
};

// Método estático para obtener estadísticas
scoreSchema.statics.getStats = async function() {
  const easyStats = await this.aggregate([
    { $match: { level: 'easy' } },
    {
      $group: {
        _id: null,
        totalPlayers: { $sum: 1 },
        highestScore: { $max: '$score' },
        averageScore: { $avg: '$score' }
      }
    }
  ]);

  const hardStats = await this.aggregate([
    { $match: { level: 'hard' } },
    {
      $group: {
        _id: null,
        totalPlayers: { $sum: 1 },
        highestScore: { $max: '$score' },
        averageScore: { $avg: '$score' }
      }
    }
  ]);

  return {
    easy: easyStats[0] || { totalPlayers: 0, highestScore: 0, averageScore: 0 },
    hard: hardStats[0] || { totalPlayers: 0, highestScore: 0, averageScore: 0 }
  };
};

// Método estático para enviar nuevo score
scoreSchema.statics.submitScore = async function(playerName, score, level) {
  const playerLevel = `${playerName}_${level}`;
  
  // Buscar score existente del jugador en este nivel
  const existingScore = await this.findOne({ playerLevel });
  
  let scoreEntry;
  let isPersonalBest = false;
  let isNewRecord = false;
  
  if (existingScore) {
    // El jugador ya tiene un score en este nivel
    if (score > existingScore.score) {
      // Nuevo score es mejor - actualizar
      existingScore.score = score;
      existingScore.date = new Date().toLocaleDateString('es-ES');
      existingScore.timestamp = new Date();
      scoreEntry = await existingScore.save();
      isPersonalBest = true;
    } else {
      // Score no es mejor - usar el existente
      scoreEntry = existingScore;
    }
  } else {
    // Nuevo jugador en este nivel
    scoreEntry = new this({
      playerName,
      score,
      level,
      date: new Date().toLocaleDateString('es-ES'),
      playerLevel
    });
    await scoreEntry.save();
    isPersonalBest = true;
  }
  
  // Verificar si es record mundial
  const topScore = await this.findOne({ level })
    .sort({ score: -1 })
    .limit(1);
    
  isNewRecord = topScore && topScore.playerLevel === playerLevel && topScore.score === score;
  
  // Obtener posición actual del jugador
  const position = await this.countDocuments({
    level,
    score: { $gt: score }
  }) + 1;
  
  // Obtener top 10
  const top10 = await this.find({ level })
    .sort({ score: -1 })
    .limit(10)
    .select('-_id -__v -createdAt -updatedAt -playerLevel')
    .lean();
  
  // Obtener total de jugadores en este nivel
  const totalPlayers = await this.countDocuments({ level });
  
  return {
    position,
    top10,
    totalPlayers,
    isNewRecord,
    isPersonalBest,
    message: isPersonalBest ? 
      (isNewRecord ? '¡Nuevo record mundial!' : '¡Nuevo record personal!') : 
      '¡Sigue intentando!'
  };
};

// Crear el modelo
const Score = mongoose.model('Score', scoreSchema);

module.exports = Score; 